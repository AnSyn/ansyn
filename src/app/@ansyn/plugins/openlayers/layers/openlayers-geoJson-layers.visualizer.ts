import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { select, Store } from '@ngrx/store';
import { ILayer, layerPluginType } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { HttpClient } from '@angular/common/http';
import { Feature, FeatureCollection } from 'geojson';
import { filter, map, mergeMap } from 'rxjs/operators';
import { selectLayers, selectSelectedLayersIds } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { combineLatest, forkJoin, Observable } from 'rxjs';
import { EntitiesVisualizer } from '@ansyn/plugins/openlayers/visualizers/entities-visualizer';
import { ICaseMapState } from '@ansyn/core/models/case.model';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { selectMapsList } from '@ansyn/map-facade/reducers/map.reducer';
import { distinctUntilChanged } from 'rxjs/internal/operators';
import { UUID } from 'angular2-uuid';
import { ImageryPlugin } from '@ansyn/imagery/model/decorators/imagery-plugin';
import { IVisualizerEntity } from '@ansyn/core/models/visualizers/visualizers-entity';
import { ImageryPluginSubscription } from '@ansyn/imagery/model/base-imagery-plugin';

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

	@ImageryPluginSubscription
	updateLayersOnMap$ = combineLatest(this.store$.pipe(select(selectLayers)), this.store$.pipe(select(selectSelectedLayersIds)), this.isHidden$)
		.pipe(
			mergeMap(([result, selectedLayerIds, isHidden]: [ILayer[], string[], boolean]) => forkJoin(result
				.filter(this.isGeoJsonLayer)
				.map((layer: ILayer) => this.layerToObservable(layer, selectedLayerIds, isHidden)))
			)
		);

	layerToObservable(layer: ILayer, selectedLayerIds, isHidden): Observable<boolean> {
		if (selectedLayerIds.includes(layer.id) && !isHidden) {
			return this.http.get(layer.url)
				.pipe(mergeMap((featureCollection: any) => {
					const entities = this.layerToEntities(featureCollection);
					return this.setEntities(entities);
				}));
		}
		return Observable.create((observer) => {
			this.clearEntities();
			observer.next(true);
		});
	}

	isGeoJsonLayer(layer: ILayer) {
		return layer.layerPluginType === layerPluginType.geoJson;
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
		super();
	}
}
