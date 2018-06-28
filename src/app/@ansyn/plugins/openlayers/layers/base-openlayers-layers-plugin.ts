import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { EntitiesVisualizer } from '@ansyn/plugins/openlayers/visualizers/entities-visualizer';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectLayers, selectSelectedLayersIds } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { map, tap } from 'rxjs/operators';
import { combineLatest } from 'rxjs/observable/combineLatest';

import { ILayer, layerPluginType } from '@ansyn/menu-items/layers-manager/models/layers.model';
import OSM from 'ol/source/osm';
import TileLayer from 'ol/layer/tile';
import { IMAGERY_MAP_COMPONENTS, ImageryMapComponentConstructor } from '@ansyn/imagery/model/imagery-map-component';
import { Inject } from '@angular/core';
import Vector from 'ol/source/vector';
import VectorLayer from 'ol/layer/vector';
import { FeatureCollection, GeoJsonObject, GeometryObject, Point as GeoPoint, Polygon } from 'geojson';
import olGeoJSON from 'ol/format/geojson';

export abstract class BaseOpenlayersLayersPlugin extends EntitiesVisualizer {

	subscribers = [];

	updateSelectedLayers$: Observable<[ILayer[], string[]]> = combineLatest(this.store$.select(selectLayers), this.store$.select(selectSelectedLayersIds))
		.pipe(
			map(([layers, selectedLayersIds]: [ILayer[], string[]]) => this.filterLayers(layers, selectedLayersIds)),
			tap(([layers, selectedLayersIds]: [ILayer[], string[]]): void => {
				this.imageryMapComponents
					.filter(({ mapClass }: ImageryMapComponentConstructor) => mapClass.groupLayers.get('layers'))
					.forEach(({ mapClass }: ImageryMapComponentConstructor) => {
						const displayedLayers: any = mapClass.groupLayers.get('layers').getLayers().getArray();
						/* remove layer if layerId not includes on selectLayers */
						displayedLayers.forEach((layer) => {
							const id = layer.get('id');
							if (!selectedLayersIds.includes(id)) {
								this.removeGroupLayer(id, 'layers');
							}
						});

						/* add layer if id includes on selectLayers but not on map */
						selectedLayersIds.forEach((layerId) => {
							const layer = displayedLayers.some((layer: any) => layer.get('id') === layerId);
							if (!layer) {
								const addLayer = layers.find(({ id }) => id === layerId);
								this.addDataLayer(addLayer, 'layers');
							}
						});
					});
			})
		);

	constructor(protected store$: Store<any>,
				@Inject(IMAGERY_MAP_COMPONENTS) protected imageryMapComponents: ImageryMapComponentConstructor[]) {
		super();
	}

	addDataLayer(layer: ILayer, groupName: string) {
		const vectorLayer = new TileLayer({
			zIndex: 1,
			source: new OSM({
				attributions: [
					layer.name
				],
				opaque: false,
				url: layer.url,
				crossOrigin: null
			})
		});
		vectorLayer.set('id', layer.id);
		this.addGroupLayer(vectorLayer, groupName);
	}

	public addGeojsonLayer(data: GeoJsonObject, groupName: string): void {
		let layer: VectorLayer = new VectorLayer({
			source: new Vector({
				features: new olGeoJSON().readFeatures(data)
			})
		});
		this.addGroupLayer(layer, groupName);
	}

	removeGroupLayer(id: string, groupName: string) {
		const group = OpenLayersMap.groupLayers.get(groupName);
		if (!group) {
			throw new Error('Tried to remove a layer to a non-existent group');
		}

		const layersArray: any[] = group.getLayers().getArray();
		let removeIdx = layersArray.indexOf(layersArray.find(l => l.get('id') === id));
		if (removeIdx >= 0) {
			group.getLayers().removeAt(removeIdx);
		}
	}

	addGroupLayer(layer: any, groupName: string) {
		const group = OpenLayersMap.groupLayers.get(groupName);
		if (!group) {
			throw new Error('Tried to add a layer to a non-existent group');
		}

		group.getLayers().push(layer);
	}

	filterLayers(layers, selectedLayersIds): [ILayer[], string[]] {
		const osmLayers = layers.filter(layer => layer.layerPluginType === layerPluginType.OSM);
		const validSelected = selectedLayersIds.filter(id => osmLayers.some((layer) => layer.id === id));
		return [osmLayers, validSelected];
	}

	onInit() {
		this.subscribers.push(
			this.updateSelectedLayers$.subscribe()
		);
	}
}
