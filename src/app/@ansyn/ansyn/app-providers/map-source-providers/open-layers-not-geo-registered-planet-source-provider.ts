import { OpenLayerPlanetSourceProvider } from './open-layers-planet-source-provider';
import { OpenLayersDisabledMap, OpenLayersMap } from '@ansyn/plugins';
import { ImageryMapSource } from '@ansyn/imagery';

export const OpenLayerNotGeoRegisteredPlanetSourceProviderSourceType = 'NOT-GEO-REGISTERED-PLANET';

@ImageryMapSource({
	sourceType: OpenLayerNotGeoRegisteredPlanetSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayerNotGeoRegisteredPlanetSourceProvider extends OpenLayerPlanetSourceProvider {
}
