import { select, Store } from '@ngrx/store';
import { HttpClient } from '@angular/common/http';
import { Feature, FeatureCollection, Polygon } from 'geojson';
import olStyle from 'ol/style/Style';
import olStroke from 'ol/style/Stroke';
import olFill from 'ol/style/Fill';
import olCircle from 'ol/style/Circle';
import {
	debounceTime,
	distinctUntilChanged,
	filter,
	map,
	retryWhen,
	switchMap,
	tap,
	withLatestFrom
} from 'rxjs/operators';
import { combineLatest, EMPTY, Observable } from 'rxjs';
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
	calculateGeometryArea,
	ExtentCollector,
	ImageryMapExtentPolygon,
	ImageryVisualizer,
	IMapSettings,
	IVisualizerEntity,
	MarkerSize, MarkerSizeDic,
	splitExtent, stringToHexRGB
} from '@ansyn/imagery';
import { LoggerService } from '../../../../core/services/logger.service';
import { isEqual } from 'lodash';
import { AutoSubscription } from 'auto-subscriptions';
import { forkJoinSafe } from '../../../../core/utils/rxjs/observables/fork-join-safe';
import { Inject } from '@angular/core';
import { IScreenViewConfig, ScreenViewConfig } from '../visualizers/models/screen-view.model';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, HttpClient, LoggerService, ScreenViewConfig],
	isHideable: true
})
export class OpenlayersGeoJsonLayersVisualizer extends EntitiesVisualizer {
	readonly STYLE_KEY = 'styleKey';
	layersToStyle: Map<string, olStyle> = new Map();
	layersDictionary: Map<string, Feature<Polygon>[]> = new Map();
	bboxToZeroEntities: Map<string, ExtentCollector> = new Map();
	selectedLayers: string[] = [];

	getCurrentMapState$: Observable<IMapSettings> = this.store$.pipe(
		select(selectMaps),
		map(maps => maps[this.mapId]),
	);

	onMapPositionChanges$ = this.getCurrentMapState$.pipe(
		map((map: IMapSettings) => map?.data?.position?.extentPolygon),
		debounceTime(this.screenViewConfig.debounceTime),
		distinctUntilChanged(isEqual),
		filter(Boolean)
	);

	getLayerSearchPolygon$: Observable<Polygon> = this.store$.pipe(
		select(selectLayerSearchPolygon),
		map((layerSearchPolygon) => layerSearchPolygon?.featureJson?.geometry)
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
			const layersObs = [];
			layers.forEach(layer => {
				const queryExtent = searchPolygon || extentPolygon;
				const layerKey = this.getLayerKey(layer);
				this.layersDictionary.set(layerKey, []);
				if (area < 1000) {
					if (!this.layersToStyle.has(layerKey)) {
						this.layersToStyle.set(layerKey, this.createLayerStyle(layerKey));
					}
					layersObs.push(this.getEntitiesForLayer(layer, queryExtent))
				} else if (area < 10000 || searchPolygon) {
					const splitExtents = splitExtent(queryExtent, 2).filter(extent => !this.noEntitiesInExtent(extent, layer));
					splitExtents.forEach(extent => {
						layersObs.push(this.countEntitiesForLayer(layer, extent))
					});
				}
			});
			if (layersObs.length === 0 && layers.length) {
				this.store$.dispatch(new SetToastMessageAction({ toastText: 'zoom to query layers' }));
			}
			return forkJoinSafe(layersObs);
		}),
		switchMap(this.drawLayer.bind(this)),
		retryWhen(err => {
			this.store$.dispatch(new SetToastMessageAction({ toastText: 'Error loading layer' }))
			return EMPTY;
		})
	);

	constructor(protected store$: Store<any>,
				protected http: HttpClient,
				protected loggerService: LoggerService,
				@Inject(ScreenViewConfig) protected screenViewConfig: IScreenViewConfig) {
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

	buildUrl(layer: ILayer, extent: ImageryMapExtentPolygon) {
		return this.http.get(layer.url, this.buildBody(extent));
	}

	buildBody(option) {
		return {}
	}

	createLayerStyle(layerKey) {
		const fill = new olFill({ color: stringToHexRGB(layerKey) });
		const stroke = new olStroke({ color: stringToHexRGB(layerKey + "10"), width: 1 });
		return new olStyle({
			fill,
			stroke,
			image: new olCircle({ fill: fill, stroke: null, radius: MarkerSizeDic[MarkerSize.medium] })
		})
	}

	protected initLayers() {
		super.initLayers();
		this.vector.setZIndex(101);
	}

	protected createStyle(feature, isStyle, ...styles): any[] {
		if (feature.get(this.STYLE_KEY)) {
			return this.layersToStyle.get(feature.get(this.STYLE_KEY));
		}
		return super.createStyle(feature, isStyle, ...styles);
	}
}
