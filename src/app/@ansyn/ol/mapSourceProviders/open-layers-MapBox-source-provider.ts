import XYZ from 'ol/source/XYZ';
import TileLayer from 'ol/layer/Tile';
import { EPSG_3857, ImageryMapSource, IMapSettings } from '@ansyn/imagery';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';
import { OpenLayersMap } from '../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from '../maps/openlayers-disabled-map/openlayers-disabled-map';

export const OpenLayerMapBoxSourceProviderSourceType = 'MapBox';

@ImageryMapSource({
	sourceType: OpenLayerMapBoxSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayerMapBoxSourceProvider extends OpenLayersMapSourceProvider {
}
