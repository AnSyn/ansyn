import TileLayer from 'ol/layer/tile';
import BingMaps from 'ol/source/bingmaps';
import { OpenLayersMapSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers.map-source-provider';
import { OpenLayersDisabledMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { ICaseMapState } from '@ansyn/core/models/case.model';
import { ImageryMapSource } from '@ansyn/imagery/model/decorators/map-source-provider';
import proj from 'ol/proj';

export interface IBingMapsConfig {
	key: string;
	styles: string[];
}

export const OpenLayerBingSourceProviderSourceType = 'BING';

@ImageryMapSource({
	sourceType: OpenLayerBingSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayerBingSourceProvider extends OpenLayersMapSourceProvider {
	create(metaData: ICaseMapState): any[] {
		const config = this.config[OpenLayerBingSourceProviderSourceType];
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
