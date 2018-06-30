import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { Store } from '@ngrx/store';
import { ImageryPlugin } from '@ansyn/imagery/model/base-imagery-plugin';
import { BaseOpenlayersLayersPlugin } from '@ansyn/plugins/openlayers/layers/base-openlayers-layers-plugin';
import { ILayer, layerPluginType } from '@ansyn/menu-items/layers-manager/models/layers.model';
import OSM from 'ol/source/osm';
import TileLayer from 'ol/layer/tile';
import { IMAGERY_IMAP } from '@ansyn/imagery/model/imap-collection';


@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Store, IMAGERY_IMAP]
})
export class OpenlayersOsmLayersPlugin extends BaseOpenlayersLayersPlugin {

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

	relevantLayers(layers): ILayer[] {
		return layers.filter(layer => layer.layerPluginType === layerPluginType.OSM);
	}
}
