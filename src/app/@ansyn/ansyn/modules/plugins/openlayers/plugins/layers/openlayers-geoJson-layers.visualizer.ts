import { select, Store } from '@ngrx/store';
import { ILayer, layerPluginTypeEnum, selectLayers, selectSelectedLayersIds } from '../../../../menu-items/public_api';
import { HttpClient } from '@angular/common/http';
import { Feature, FeatureCollection } from 'geojson';
import { catchError, filter, map, mergeMap } from 'rxjs/operators';
import { combineLatest, forkJoin, Observable, of } from 'rxjs';
import { ICaseMapState, IVisualizerEntity, SetToastMessageAction } from '@ansyn/core';
import { MapFacadeService, selectMapsList } from '@ansyn/map-facade';
import { distinctUntilChanged } from 'rxjs/internal/operators';
import { UUID } from 'angular2-uuid';
import { ImageryPlugin } from '@ansyn/imagery';
import { AutoSubscription } from 'auto-subscriptions';
import { OpenLayersMap } from '../../maps/open-layers-map/openlayers-map/openlayers-map';
import { EntitiesVisualizer } from '../visualizers/entities-visualizer';

@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Store, HttpClient]
})
export class OpenlayersGeoJsonLayersVisualizer extends EntitiesVisualizer {

	isHidden$ = this.store$.select(selectMapsList).pipe(
		map((mapsList) => MapFacadeService.mapById(mapsList, this.mapId)),
		filter(Boolean),
		map((map: ICaseMapState) => map.flags.displayLayers),
		distinctUntilChanged()
	);

	@AutoSubscription
	updateLayersOnMap$ = combineLatest(this.store$.pipe(select(selectLayers)), this.store$.pipe(select(selectSelectedLayersIds)), this.isHidden$)
		.pipe(
			mergeMap(([result, selectedLayerIds, isHidden]: [ILayer[], string[], boolean]) => forkJoin(result
				.filter(this.isGeoJsonLayer)
				.map((layer: ILayer) => this.layerToObservable(layer, selectedLayerIds, isHidden)))
			)
		);

	parseLayerData(data) {
		return data; // override if other data is used
	}

	layerToObservable(layer: ILayer, selectedLayerIds, isHidden): Observable<boolean> {
		if (selectedLayerIds.includes(layer.id) && !isHidden) {
			return this.http.get(layer.url)
				.pipe(
					map((data) => this.parseLayerData(data)),
					mergeMap((featureCollection: any) => {
						const entities = this.layerToEntities(featureCollection);
						return this.setEntities(entities);
					}),
					catchError((e) => {
						this.store$.dispatch(new SetToastMessageAction({ toastText: `Failed to load layer${(e && e.error) ? ' ,' + e.error : ''}`}));
						return of(true);
					})
				);
		}
		return Observable.create((observer) => {
			this.clearEntities();
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
	}
}
