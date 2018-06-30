import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { Store } from '@ngrx/store';
import { ImageryPlugin } from '@ansyn/imagery/model/base-imagery-plugin';
import { BaseOpenlayersLayersPlugin } from '@ansyn/plugins/openlayers/layers/base-openlayers-layers-plugin';
import { ILayer, layerPluginType } from '@ansyn/menu-items/layers-manager/models/layers.model';
import Vector from 'ol/source/vector';
import VectorLayer from 'ol/layer/vector';
import { GeoJsonObject } from 'geojson';
import olGeoJSON from 'ol/format/geojson';
import { IMAGERY_IMAP } from '@ansyn/imagery/model/imap-collection';
import { IMapConstructor } from '@ansyn/imagery/model/imap';

@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Store, IMAGERY_IMAP]
})
export class OpenlayersGeoJsonLayersPlugin extends BaseOpenlayersLayersPlugin {

	addDataLayer(data: GeoJsonObject): void {
		let layer: VectorLayer = new VectorLayer({
			source: new Vector({
				format: new olGeoJSON,
				url: 'http://localhost:4200/assets/geoJsonExample.json'
			})
		});
		this.addGroupLayer(layer, 'geoJsonLayers');
	}

	relevantLayers(layers): ILayer[] {
		return layers.filter(layer => layer.layerPluginType === layerPluginType.geoJson);
	}

	getGroupLayers(iMapConstructor: IMapConstructor) {
		return iMapConstructor.groupLayers.get('geoJsonLayers');
	}

	removeDataLayer(id: string): void {
		this.removeGroupLayer(id, 'geoJsonLayers');
	}
}
