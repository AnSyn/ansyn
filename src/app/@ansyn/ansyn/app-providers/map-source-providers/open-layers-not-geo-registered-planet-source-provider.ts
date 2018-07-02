import { OpenLayerPlanetSourceProvider } from './open-layers-planet-source-provider';
import { OpenLayersDisabledMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { ImageryMapSource } from '@ansyn/imagery/model/decorators/map-source-provider';

export const OpenLayerNotGeoRegisteredPlanetSourceProviderSourceType = 'NOT-GEO-REGISTERED-PLANET';

@ImageryMapSource({
	sourceType: OpenLayerNotGeoRegisteredPlanetSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayerNotGeoRegisteredPlanetSourceProvider extends OpenLayerPlanetSourceProvider {
}
