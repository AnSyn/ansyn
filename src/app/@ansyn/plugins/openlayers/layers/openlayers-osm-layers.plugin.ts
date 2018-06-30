import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { Store } from '@ngrx/store';
import { ImageryPlugin } from '@ansyn/imagery/model/base-imagery-plugin';
import { BaseOpenlayersLayersPlugin } from '@ansyn/plugins/openlayers/layers/base-openlayers-layers-plugin';
import { ILayer, layerPluginType } from '@ansyn/menu-items/layers-manager/models/layers.model';
import OSM from 'ol/source/osm';
import TileLayer from 'ol/layer/tile';
import { IMAGERY_IMAP } from '@ansyn/imagery/model/imap-collection';
import { IMapConstructor } from '@ansyn/imagery/model/imap';


@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Store, IMAGERY_IMAP]
})
export class OpenlayersOsmLayersPlugin extends BaseOpenlayersLayersPlugin {

	addDataLayer(layer: ILayer) {
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
		this.addGroupLayer(vectorLayer, 'layers');
	}

	removeDataLayer(id: string): void {
		this.removeGroupLayer(id, 'layers');
	}

	relevantLayers(layers): ILayer[] {
		return layers.filter(layer => layer.layerPluginType === layerPluginType.OSM);
	}

	getGroupLayers(iMapConstructor: IMapConstructor) {
		return iMapConstructor.groupLayers.get('layers');
	}

}
