import { ImageryMapSource } from '@ansyn/imagery';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';
import { OpenLayersMap } from '../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from '../maps/openlayers-disabled-map/openlayers-disabled-map';

export const OpenLayerPlanetSourceProviderSourceType = 'PLANET';

@ImageryMapSource({
	sourceType: OpenLayerPlanetSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayerPlanetSourceProvider extends OpenLayersMapSourceProvider {
}
