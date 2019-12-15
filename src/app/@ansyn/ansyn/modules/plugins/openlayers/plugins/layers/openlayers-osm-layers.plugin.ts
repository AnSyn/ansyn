import { Store } from '@ngrx/store';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import { ImageryPlugin } from '@ansyn/imagery';
import { OpenLayersMap } from '@ansyn/ol';
import { OpenlayersBaseLayersPlugins } from './openlayers-base-layers.plugins';
import { ILayer, layerPluginTypeEnum } from '../../../../menu-items/layers-manager/models/layers.model';
import { Observable, of } from 'rxjs';


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

	createLayer(layer: ILayer): Observable<TileLayer> {
		const vector = new TileLayer({
			preload: Infinity,
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
		return of(vector);
	}
}
