import { Store } from '@ngrx/store';
import { ILayer, layerPluginTypeEnum } from '@ansyn/menu-items';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import { ImageryPlugin } from '@ansyn/imagery';
import { OpenLayersMap } from '../../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenlayersBaseLayersPlugins } from "./openlayers-base-layers.plugins";


@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Store]
})
export class OpenlayersOsmLayersPlugin extends OpenlayersBaseLayersPlugins {
	constructor(protected store$: Store<any>) {
		super(store$);
	}

	checkLayer(layer: ILayer) {
		return layer.layerPluginType === layerPluginTypeEnum.OSM;
	}

	createLayer(layer: ILayer): TileLayer {
		const vector = new TileLayer({
			zIndex: 100,
			source: new OSM({
				attributions: [
					layer.name
				],
				opaque: false,
				url: layer.url,
				crossOrigin: null
			})
		});
		vector.set('id', layer.id);
		return vector;
	}
}
