import XYZ from 'ol/source/xyz';
import TileLayer from 'ol/layer/tile';
import { OpenLayersDisabledMap, OpenLayersMap } from '@ansyn/plugins';
import { ICaseMapState } from '@ansyn/core';
import { ImageryMapSource } from '@ansyn/imagery';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';

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
