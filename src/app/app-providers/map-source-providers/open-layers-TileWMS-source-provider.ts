/**
 * Created by AsafMas on 21/05/2017.
 */

import { BaseMapSourceProvider } from '@ansyn/imagery';
import * as ol from 'openlayers';

export const OpenLayerTileWMSSourceProviderMapType = 'openLayersMap';
export const OpenLayerTileWMSSourceProviderSourceType = 'TileWMS';

export class OpenLayerTileWMSSourceProvider extends BaseMapSourceProvider {
	public mapType;
	public sourceType;

	constructor() {
		super();

		this.mapType = OpenLayerTileWMSSourceProviderMapType;
		this.sourceType = OpenLayerTileWMSSourceProviderSourceType;
	}

	create(metaData: any): any {
		const layers = metaData.layers.join(',');
		const tiled = new ol.layer.Tile({
			visible: true,
			source: new ol.source.TileWMS({
				url: metaData.url,
				params: {
					'VERSION': '1.1.1',
					LAYERS: layers
				},
				projection: metaData.projection
			})
		});
		return [tiled];
	}

	createAsync(metaData: any): Promise<any> {
		let layer = this.create(metaData);
		return Promise.resolve(layer);
	}
}
