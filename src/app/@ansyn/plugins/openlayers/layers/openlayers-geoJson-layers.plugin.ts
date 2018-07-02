import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { Store } from '@ngrx/store';
import { ILayer, layerPluginType } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { IVisualizerEntity } from '@ansyn/imagery/model/base-imagery-visualizer';
import { HttpClient } from '@angular/common/http';
import { Feature, FeatureCollection } from 'geojson';
import { filter, map, mergeMap } from 'rxjs/operators';
import { selectLayers, selectSelectedLayersIds } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { combineLatest, forkJoin, Observable } from 'rxjs';
import { ImageryPlugin } from '@ansyn/imagery/model/base-imagery-plugin';
import { EntitiesVisualizer } from '@ansyn/plugins/openlayers/visualizers/entities-visualizer';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { selectMapsList } from '@ansyn/map-facade/reducers/map.reducer';
import { distinctUntilChanged } from 'rxjs/internal/operators';
import { UUID } from 'angular2-uuid';

@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Store, HttpClient]
})
export class OpenlayersGeoJsonLayersPlugin extends EntitiesVisualizer {

	isHidden$ = this.store$.select(selectMapsList).pipe(
		map((mapsList) => MapFacadeService.mapById(mapsList, this.mapId)),
		filter(Boolean),
		map((map: CaseMapState) => map.flags.layers),
		distinctUntilChanged()
	);

	update$ = combineLatest(this.store$.select(selectLayers), this.store$.select(selectSelectedLayersIds), this.isHidden$)
		.pipe(
			mergeMap(([result, selectedLayerId, isHidden]: [ILayer[], string[], boolean]) => {
				const obsList = result
					.filter((layer: ILayer) => layer.layerPluginType === layerPluginType.geoJson)
					.map((layer: ILayer) => {
						if (selectedLayerId.includes(layer.id) && !isHidden) {
							return this.http.get(layer.url)
								.pipe(mergeMap((featureCollection: any) => {
									const entities = this.layerToEntities(featureCollection);
									return this.setEntities(entities);
								}));
						} else {
							return Observable.create((observer) => {
								this.clearEntities();
								observer.next(true);
							});
						}
					});
				return forkJoin(obsList);
			})
		);

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

	onInit() {
		super.onInit();
		this.subscriptions.push(
			this.update$.subscribe()
		);
	}

	constructor(protected store$: Store<any>,
				protected http: HttpClient) {
		super();
	}
}
