import XYZ from 'ol/source/XYZ';
import TileLayer from 'ol/layer/Tile';
import { ICaseMapState } from '../../../core/public_api';
import { ImageryMapSource } from '@ansyn/imagery';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';
import { OpenLayersMap } from '../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from '../maps/openlayers-disabled-map/openlayers-disabled-map';

export const OpenLayerMapBoxSourceProviderSourceType = 'MapBox';

@ImageryMapSource({
	sourceType: OpenLayerMapBoxSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayerMapBoxSourceProvider extends OpenLayersMapSourceProvider {
	create(metaData: ICaseMapState): any[] {
		const source = new XYZ({
			url: metaData.data.overlay.imageUrl,
			crossOrigin: 'Anonymous',
			projection: 'EPSG:3857'
		});

		const mapBoxLayer = new TileLayer(<any>{
			source: source,
			visible: true,
			preload: Infinity
		});

		return [mapBoxLayer];
	}
}
