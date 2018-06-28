import XYZ from 'ol/source/xyz';
import TileLayer from 'ol/layer/tile';
import { OpenLayersMapSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers.map-source-provider';
import { OpenLayersDisabledMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { ImageryMapSource } from '@ansyn/imagery/model/base-map-source-provider';

export const OpenLayerMapBoxSourceProviderSourceType = 'MapBox';

@ImageryMapSource({
	sourceType: OpenLayerMapBoxSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayerMapBoxSourceProvider extends OpenLayersMapSourceProvider {
	create(metaData: any): any[] {
		const source = new XYZ({
			url: metaData.imageUrl,
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
