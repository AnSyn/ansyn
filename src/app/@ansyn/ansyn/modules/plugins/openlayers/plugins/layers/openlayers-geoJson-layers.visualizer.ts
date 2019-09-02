import { select, Store } from '@ngrx/store';
import { HttpClient } from '@angular/common/http';
import { Feature, FeatureCollection, Polygon } from 'geojson';
import { catchError, filter, map, mergeMap, distinctUntilChanged, withLatestFrom, debounceTime } from 'rxjs/operators';
import { combineLatest, forkJoin, Observable, of, Subscription } from 'rxjs';
import { getPolygonIntersectionRatioWithMultiPolygon, IMapSettings, IVisualizerEntity } from '@ansyn/imagery';
import { MapFacadeService, selectMaps, selectMapsList, SetToastMessageAction } from '@ansyn/map-facade';
import { UUID } from 'angular2-uuid';
import { ImageryPlugin } from '@ansyn/imagery';
import { AutoSubscription } from 'auto-subscriptions';
import { EntitiesVisualizer, OpenLayersMap } from '@ansyn/ol';
import { ILayer, layerPluginTypeEnum } from '../../../../menu-items/layers-manager/models/layers.model';
import { selectLayers, selectSelectedLayersIds } from '../../../../menu-items/layers-manager/reducers/layers.reducer';
import { ICaseMapState } from '../../../../menu-items/cases/models/case.model';
import { Dictionary } from '@ngrx/entity';
import { booleanContains, intersect } from '@turf/turf';

@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Store, HttpClient]
})
export class OpenlayersGeoJsonLayersVisualizer extends EntitiesVisualizer {
	layersDictionary: { [key: string]: IVisualizerEntity[] };
	showedLayersDictionary: string[];
	protected subscriptions: Subscription[] = [];
	currentExtent: Polygon;

	isHidden$ = this.store$.select(selectMapsList).pipe(
		map((mapsList) => MapFacadeService.mapById(mapsList, this.mapId)),
		filter(Boolean),
		map((map: ICaseMapState) => map.flags.displayLayers),
		distinctUntilChanged()
	);

	// todo: return auto-subscription when the bug is fixed
	updateLayersOnMap$ = combineLatest(this.store$.pipe(select(selectSelectedLayersIds)), this.isHidden$)
		.pipe(
			withLatestFrom(this.store$.select(selectLayers)),
			mergeMap(([[selectedLayerIds, isHidden], layers]: [[string[], boolean], ILayer[]]) => {
					const filteredLayers = layers.filter(this.isGeoJsonLayer);
					return forkJoin(
						filteredLayers.map((layer: ILayer) =>
							this.layerToObservable(layer, selectedLayerIds, isHidden)))
				}
			)
		);

	// todo: return auto-subscription when the bug is fixed
	updateLayerScale$ = this.store$.select(selectMaps).pipe( // todo: select extent by map id from store
		debounceTime(500),
		mergeMap((mapState: Dictionary<ICaseMapState>) => {
			const mapSettings: IMapSettings = mapState[this.mapId];
			// used squareGrid to get the extent grid
			this.currentExtent = mapSettings.data.position.extentPolygon;
			const entities = [];
			this.showedLayersDictionary.forEach((layerId) => {
				const layerEntities = this.getLayerEntities(layerId);
				entities.push(...layerEntities);
			});
			return this.setEntities(entities);
		})
	);

	onInitSubscriptions(): void {
		super.onInitSubscriptions();
		this.subscriptions.push(
			this.updateLayersOnMap$.subscribe(() => {
			}),
			this.updateLayerScale$.subscribe(() => {
			})
		)
	}

	onDispose(): void {
		this.subscriptions.forEach((sub) => sub.unsubscribe());
		this.subscriptions = [];
		super.onDispose();
	}

	parseLayerData(data): FeatureCollection<any> {
		return data; // override if other data is used
	}

	getOptions() {
		return undefined; // override if other data is used
	}

	getLayerEntities(layerId): IVisualizerEntity[] {
		const entities: IVisualizerEntity[] = this.layersDictionary[layerId];
		const filteredEntities = entities.filter((entity: IVisualizerEntity) => {
			try {
				switch (entity.featureJson.geometry.type) {
					case 'Point': {
						return booleanContains(this.currentExtent, entity.featureJson);
					}
					case 'Polygon': {
						const intersection = intersect(this.currentExtent, entity.featureJson);
						return Boolean(intersection);
					}
					case 'MultiPolygon': {
						const intersection = getPolygonIntersectionRatioWithMultiPolygon(this.currentExtent, entity.featureJson.geometry);
						return Boolean(intersection);
					}
					default: {
						console.warn('not supported layer entity: ', entity.featureJson.geometry.type);
						return false;
					}
				}
			} catch (exception) {
				console.warn('turf error for: ', entity);
				return false;
			}
		});
		// console.log('layer entities count: ', entities.length);
		// console.log('layer entities count in extent: ', filteredEntities.length);
		return filteredEntities;
	}

	drawLayer(layerId): Observable<boolean> {
		const entities = this.getLayerEntities(layerId);
		return this.setEntities(entities);
	}

	layerToObservable(layer: ILayer, selectedLayerIds, isHidden): Observable<boolean> {
		if (selectedLayerIds.includes(layer.id) && !isHidden) {
			this.showedLayersDictionary.push(layer.name);
			if (this.layersDictionary[layer.name]) {
				return this.drawLayer(layer.name);
			}
			const options = this.getOptions();
			return this.http.get(layer.url, options)
				.pipe(
					map((data) => this.parseLayerData(data)),
					mergeMap((featureCollection: any) => {
						const entities = this.layerToEntities(featureCollection);
						this.layersDictionary[layer.name] = entities;
						return this.drawLayer(layer.name);
					}),
					catchError((e) => {
						this.store$.dispatch(new SetToastMessageAction({ toastText: `Failed to load layer${ (e && e.error) ? ' ,' + e.error : '' }` }));
						return of(true);
					})
				);
		}
		// todo: deprecated
		return Observable.create((observer) => {
			this.showedLayersDictionary = this.showedLayersDictionary.filter((id) => layer.name !== id);
			if (this.layersDictionary[layer.name]) {
				this.layersDictionary[layer.name].forEach((entity) => {
					this.removeEntity(entity.id);
				});
			}
			observer.next(true);
		});
	}

	isGeoJsonLayer(layer: ILayer) {
		return layer.layerPluginType === layerPluginTypeEnum.geoJson;
	}

	layerToEntities(collection: FeatureCollection<any>): IVisualizerEntity[] {
		return collection.features.map((feature: Feature<any>): IVisualizerEntity => ({
			id: feature.properties.id || UUID.UUID(),
			featureJson: feature,
			style: feature.properties.style
		}));
	}

	constructor(protected store$: Store<any>,
				protected http: HttpClient) {
		super({
			initial: {
				'fill-opacity': 0
			}
		});
		this.layersDictionary = {};
		this.showedLayersDictionary = [];
	}
}
