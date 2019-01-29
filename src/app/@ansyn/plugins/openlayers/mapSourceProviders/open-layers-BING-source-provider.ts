import TileLayer from 'ol/layer/Tile';
import BingMaps from 'ol/source/BingMaps';
import { ICaseMapState } from '@ansyn/core';
import { ImageryMapSource } from '@ansyn/imagery';
import * as proj from 'ol/proj';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';
import { OpenLayersMap } from '../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from '../maps/openlayers-disabled-map/openlayers-disabled-map';

export interface IBingMapsConfig {
	key: string;
	styles: string[];
}

export const OpenLayerBingSourceProviderSourceType = 'BING';

@ImageryMapSource({
	sourceType: OpenLayerBingSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayerBingSourceProvider extends OpenLayersMapSourceProvider<IBingMapsConfig> {
	create(metaData: ICaseMapState): any[] {
		const { config } = this;
		const source = new BingMaps({
			key: config.key,
			imagerySet: config.styles[0],
			maxZoom: 19
		});

		const [x, y] = proj.transform([-180, -90], 'EPSG:4326', 'EPSG:3857');
		const [x1, y1] = proj.transform([180, 90], 'EPSG:4326', 'EPSG:3857');
		const extent = [x, y, x1, y1];

		const result = new TileLayer(<any>{
			visible: true,
			preload: Infinity,
			source,
			extent
		});
		return [result];
	}
}
