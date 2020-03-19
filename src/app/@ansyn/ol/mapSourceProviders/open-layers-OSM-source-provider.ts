import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import { ImageryMapSource, IMapSettings } from '@ansyn/imagery';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';
import { OpenLayersMap } from '../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from '../maps/openlayers-disabled-map/openlayers-disabled-map';

export const OpenLayerOSMSourceProviderSourceType = 'OSM';


@ImageryMapSource({
	sourceType: OpenLayerOSMSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayerOSMSourceProvider extends OpenLayersMapSourceProvider {
	create(metaData: IMapSettings): Promise<any> {
		const osmLayer = new TileLayer({
			source: new OSM({wrapX: false})
		});
		// const source = new OSM(<any>{
		// 	attributions: [
		// 		'All maps © <a href="http://www.openseamap.org/">OpenSeaMap</a>',
		// 		OSM.ATTRIBUTION
		// 	],
		// 	opaque: false,
		// 	url: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png'
		// });
		// const openSeaMapLayer = new TileLayer({ source });
		return Promise.resolve(osmLayer);
	}
}
