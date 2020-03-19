import TileLayer from 'ol/layer/Tile';
import BingMaps from 'ol/source/BingMaps';
import { EPSG_3857, EPSG_4326, ImageryMapSource, IMapSettings } from '@ansyn/imagery';
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
	create(metaData: IMapSettings): Promise<any> {
		const config = {...this.config, ...metaData.data.config};
		const source = new BingMaps({
			key: config.key,
			imagerySet: config.style,
			maxZoom: 19,
			wrapX: false
		});

		const [x, y] = proj.transform([-180, -90], EPSG_4326, EPSG_3857);
		const [x1, y1] = proj.transform([180, 90], EPSG_4326, EPSG_3857);
		const extent = [x, y, x1, y1];

		const result = new TileLayer(<any>{
			visible: true,
			preload: Infinity,
			source,
			extent
		});
		return Promise.resolve(result);
	}
}
