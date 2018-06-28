import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { Store } from '@ngrx/store';
import { ImageryPlugin } from '@ansyn/imagery/model/base-imagery-plugin';
import { BaseOpenlayersLayersPlugin } from '@ansyn/plugins/openlayers/layers/base-openlayers-layers-plugin';
import { ILayer, layerPluginType } from '@ansyn/menu-items/layers-manager/models/layers.model';
import Vector from 'ol/source/vector';
import VectorLayer from 'ol/layer/vector';
import { GeoJsonObject } from 'geojson';
import olGeoJSON from 'ol/format/geojson';
import { IMAGERY_MAP_COMPONENTS, ImageryMapComponentConstructor } from '@ansyn/imagery/model/imagery-map-component';
import { Inject } from '@angular/core';

@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Store, IMAGERY_MAP_COMPONENTS]
})
export class OpenlayersGeoJsonLayersPlugin extends BaseOpenlayersLayersPlugin {

	addDataLayer(data: GeoJsonObject, groupName: string): void {
		let layer: VectorLayer = new VectorLayer({
			source: new Vector({
				format: new olGeoJSON,
				url: 'http://localhost:4200/assets/geoJsonExample.json'
			})
		});
		this.addGroupLayer(layer, groupName);
	}

	relevantLayers(layers): ILayer[] {
		return layers.filter(layer => layer.layerPluginType === layerPluginType.geoJson);
	}
}
