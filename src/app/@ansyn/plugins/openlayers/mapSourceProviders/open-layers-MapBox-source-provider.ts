import XYZ from 'ol/source/xyz';
import TileLayer from 'ol/layer/tile';
import { ICaseMapState } from '@ansyn/core';
import { ImageryMapSource } from '@ansyn/imagery';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';
import { OpenLayersMap } from '../maps/open-layers-map/openlayers-map/openlayers-map';

export const OpenLayerMapBoxSourceProviderSourceType = 'MapBox';

@ImageryMapSource({
	sourceType: OpenLayerMapBoxSourceProviderSourceType,
	supported: [OpenLayersMap]
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
