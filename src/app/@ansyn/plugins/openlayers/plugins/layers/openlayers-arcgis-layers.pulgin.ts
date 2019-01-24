import { Store } from '@ngrx/store';
import { ILayer, layerPluginType } from '@ansyn/menu-items';
import TileXYZ from 'ol/source/xyz';
import TileLayer from 'ol/layer/tile';
import { ImageryPlugin } from '@ansyn/imagery';
import { OpenLayersMap } from '../../maps/open-layers-map/openlayers-map/openlayers-map';
import proj from 'ol/proj'
import { OpenlayersBaseLayersPlugins } from "./openlayers-base-layers.plugins";

@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Store]
})
export class OpenlayersArcgisLayersPulgin extends OpenlayersBaseLayersPlugins {
	constructor(protected store$: Store<any>) {
		super(store$);
	}

	checkLayer(layer: ILayer) {
		return layer.layerPluginType === layerPluginType.ARCGIS
	}

	createLayer(layer: ILayer): TileLayer {
		const extent: any = proj.transformExtent(layer.extent, 'EPSG:4326', this.iMap.mapObject.getView().getProjection());
		const vector = new TileLayer({
			zIndex: 100,
			extent,
			source: new TileXYZ({
				attributions: [
					layer.name
				],
				url: layer.url,
				crossOrigin: null
			})
		});
		vector.set('id', layer.id);
		return vector;
	}
}
