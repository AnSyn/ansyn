import { Store } from '@ngrx/store';
import XYZ from 'ol/source/XYZ';
import TileLayer from 'ol/layer/Tile';
import { ImageryPlugin } from '@ansyn/imagery';
import { OpenLayersMap } from '@ansyn/ol';
import * as proj from 'ol/proj';
import { OpenlayersBaseLayersPlugins } from './openlayers-base-layers.plugins';
import { ILayer, layerPluginTypeEnum } from '../../../../menu-items/layers-manager/models/layers.model';
import { Observable, of } from 'rxjs';

@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Store]
})
export class OpenlayersArcgisLayersPulgin extends OpenlayersBaseLayersPlugins {
	constructor(protected store$: Store<any>) {
		super(store$);
	}

	checkLayer(layer: ILayer) {
		return layer.layerPluginType === layerPluginTypeEnum.ARCGIS
	}

	createLayer(layer: ILayer): Observable<TileLayer> {
		const extent: any = proj.transformExtent(layer.extent, 'EPSG:4326', this.iMap.mapObject.getView().getProjection());
		const vector = new TileLayer({
			preload: Infinity,
			zIndex: 100,
			extent,
			source: new XYZ({
				attributions: [
					layer.name
				],
				url: layer.url,
				crossOrigin: null
			})
		});
		vector.set('id', layer.id);
		return of(vector);
	}
}
