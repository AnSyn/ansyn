import TileLayer from 'ol/layer/tile';
import TileWMS from 'ol/source/tilewms';
import { OpenLayersDisabledMap, OpenLayersMap } from '@ansyn/plugins';
import { ICaseMapState } from '@ansyn/core';
import { ImageryMapSource } from '@ansyn/imagery';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';

export const OpenLayerTileWMSSourceProviderSourceType = 'TileWMS';

@ImageryMapSource({
	sourceType: OpenLayerTileWMSSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayerTileWMSSourceProvider extends OpenLayersMapSourceProvider {
	create(metaData: ICaseMapState): any[] {
		const { config } = this;
		const layers = config.layers.join(',');

		const source = new TileWMS(<any>{
			preload: Infinity,
			url: config.url,
			params: {
				'VERSION': '1.1.1',
				LAYERS: layers
			},
			projection: config.projection
		});

		const tiled = new TileLayer({ visible: true, source });
		return [tiled];
	}
}
