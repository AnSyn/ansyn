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
	createSource(metaData: IMapSettings): any {
		return new OSM({wrapX: false});
	}
}
