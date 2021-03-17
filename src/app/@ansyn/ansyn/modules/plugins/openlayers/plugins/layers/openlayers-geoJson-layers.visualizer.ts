import { select, Store } from '@ngrx/store';
import { HttpClient } from '@angular/common/http';
import { Feature, FeatureCollection, Polygon } from 'geojson';
import { containsExtent } from 'ol/extent'
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap, withLatestFrom, startWith } from 'rxjs/operators';
import { combineLatest, Observable, scheduled } from 'rxjs';
import { selectMaps, SetToastMessageAction } from '@ansyn/map-facade';
import { UUID } from 'angular2-uuid';
import { EntitiesVisualizer, OpenLayersMap } from '@ansyn/ol';
import { ILayer, layerPluginTypeEnum } from '../../../../menu-items/layers-manager/models/layers.model';
import {
	selectLayers,
	selectLayerSearchPolygon,
	selectSelectedLayersIds
} from '../../../../menu-items/layers-manager/reducers/layers.reducer';
import { feature, featureCollection } from '@turf/turf';
import {
	BBOX,
	bboxFromGeoJson,
	calculateGeometryArea, ExtentCollector,
	ImageryMapExtentPolygon,
	ImageryVisualizer,
	IMapSettings,
	IVisualizerEntity, splitExtent
} from '@ansyn/imagery';
import { LoggerService } from '../../../../core/services/logger.service';
import { isEqual } from 'lodash';
import { AutoSubscription } from 'auto-subscriptions';
import { forkJoinSafe } from '../../../../core/utils/rxjs/observables/fork-join-safe';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, HttpClient, LoggerService],
	isHideable: true
})
export class OpenlayersGeoJsonLayersVisualizer extends EntitiesVisualizer {
	layersDictionary: Map<string, Feature<Polygon>[]> = new Map();
	bboxToZeroEntities: Map<string, ExtentCollector> = new Map();
	selectedLayers: string[] = [];

	getCurrentMapState$: Observable<IMapSettings> = this.store$.pipe(
		select(selectMaps),
		map(maps => maps[this.mapId]),
	);

	onMapPositionChanges$ = this.getCurrentMapState$.pipe(
		map((map: IMapSettings) => map?.data?.position?.extentPolygon),
		debounceTime(1000),
		distinctUntilChanged(isEqual),
		filter(Boolean)
	);

	getLayerSearchPolygon$: Observable<Polygon> = this.store$.pipe(
		select(selectLayerSearchPolygon),
		map( (layerSearchPolygon) => layerSearchPolygon?.featureJson?.geometry )
	);

	selectedLayersChange$ = this.store$.pipe(
		select(selectSelectedLayersIds),
		withLatestFrom(this.store$.pipe(select(selectLayers))),
		filter(([selectedLayersIds, layers]: [string[], ILayer[]]) => Boolean(layers)),
		map(([selectedLayersIds, layers]: [string[], ILayer[]]) =>
			layers.filter(layer => this.isGeoJsonLayer(layer) && selectedLayersIds.includes(layer.id))),
		tap((layers: ILayer[]) => {
			this.selectedLayers = [];
			layers.forEach(layer => {
				const key = this.getLayerKey(layer);
				if (!this.bboxToZeroEntities.has(key)) {
					this.bboxToZeroEntities.set(key, new ExtentCollector());
				}
				this.selectedLayers.push(key);
			})
		})
	);

	@AutoSubscription
	onLayersHideChange$ = this.getCurrentMapState$.pipe(
		map((map: IMapSettings) => map?.flags?.hideLayers),
		distinctUntilChanged(isEqual),
		tap(hide => this.setVisibility(!hide))
	);

	@AutoSubscription
	onMapChange$ = combineLatest([this.selectedLayersChange$, this.onMapPositionChanges$, this.getLayerSearchPolygon$]).pipe(
		filter(() => !this.isHidden),
		switchMap(([layers, extentPolygon, searchPolygon]: [ILayer[], ImageryMapExtentPolygon, Polygon]) => {
			const area = calculateGeometryArea(extentPolygon) * 1e-6;
			let layersObs = [];
			layers.forEach(layer => {
				const layerKey = this.getLayerKey(layer);
				this.layersDictionary.set(layerKey, []);
				const splitExtents = splitExtent(searchPolygon || extentPolygon, 2).filter(extent => !this.noEntitiesInExtent(extent, layer));
				splitExtents.forEach(extent => {
					if (area < 1000) {
						layersObs.push(this.getEntitiesForLayer(layer, extent))
					} else if (area < 10000) {
						layersObs.push(this.countEntitiesForLayer(layer, extent))
					}
				});
			});
			if (layersObs.length === 0 && layers.length) {
				this.store$.dispatch(new SetToastMessageAction({ toastText: 'zoom to query layers' }));
			}
			return forkJoinSafe(layersObs);
		}),
		switchMap(this.drawLayer.bind(this))
	);

	constructor(protected store$: Store<any>,
				protected http: HttpClient,
				protected loggerService: LoggerService) {
		super({
			initial: {
				'fill-opacity': 0
			}
		});
	}

	getOptions() {
		return undefined; // override if other data is used
	}

	drawLayer(): Observable<boolean> {
		const allEntities: Feature[] = [];
		this.selectedLayers.forEach(layerKey => {
			if (this.layersDictionary.has(layerKey)) {
				allEntities.push(...this.layersDictionary.get(layerKey));
			}
		});
		return this.setEntities(this.layerToEntities(featureCollection(allEntities)));
	}

	getEntitiesForLayer(layer: ILayer, extent: ImageryMapExtentPolygon): Observable<any> {
		return this.requestEntities(layer, extent);
	}

	countEntitiesForLayer(layer: ILayer, extent: ImageryMapExtentPolygon): Observable<any> {
		return this.requestEntities(layer, extent);
	}

	requestEntities(layer: ILayer, extent: ImageryMapExtentPolygon) {
		const layerKey = this.getLayerKey(layer);
		return this.getRequest(layer, extent).pipe(
			tap((data: any) => {
				if (data?.total_entities > 0) {
					this.layersDictionary.get(layerKey).push(feature(extent, data));
				} else {
					this.bboxToZeroEntities.get(layerKey).add(extent);
				}
			})
		)
	}

	noEntitiesInExtent(extent: ImageryMapExtentPolygon, layer: ILayer) {
		const layerKey = this.getLayerKey(layer);
		const savedExtent: ExtentCollector = this.bboxToZeroEntities.get(layerKey);
		return savedExtent.isInside(extent)
	}

	getLayerKey(layer: ILayer): string {
		return `${ layer.name }-${ layer.id }`;
	}

	getRequest(layer: ILayer, extent: ImageryMapExtentPolygon): Observable<any> {
		return this.buildUrl(layer, extent);
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

	fixFeature(feature: Feature) {
		return feature;
	}

	buildUrl(layer: ILayer, extent: ImageryMapExtentPolygon) {
		return this.http.get(layer.url, this.buildBody(extent));
	}

	buildBody(option) {
		return {}
	}
}
