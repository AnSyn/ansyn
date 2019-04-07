import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import { ImageryMapSource } from '@ansyn/imagery';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';
import { OpenLayersMap } from '../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from '../maps/openlayers-disabled-map/openlayers-disabled-map';
import { ICaseMapState } from '../../../menu-items/cases/models/case.model';

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
