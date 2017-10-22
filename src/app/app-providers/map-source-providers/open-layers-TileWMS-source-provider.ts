import { BaseMapSourceProvider } from '@ansyn/imagery';
import TileLayer from 'ol/layer/tile';
import TileWMS from 'ol/source/tilewms';

export const OpenLayerTileWMSSourceProviderMapType = 'openLayersMap';
export const OpenLayerTileWMSSourceProviderSourceType = 'TileWMS';

export class OpenLayerTileWMSSourceProvider extends BaseMapSourceProvider {
	public mapType = OpenLayerTileWMSSourceProviderMapType;
	public sourceType = OpenLayerTileWMSSourceProviderSourceType;

	create(metaData: any): any {
		const layers = metaData.layers.join(',');
		const tiled = new TileLayer({
			visible: true,
			source: new TileWMS({
				preload: Infinity,
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
