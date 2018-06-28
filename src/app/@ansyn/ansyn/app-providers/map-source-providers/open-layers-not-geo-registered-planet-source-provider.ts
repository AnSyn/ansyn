import { OpenLayerPlanetSourceProvider } from './open-layers-planet-source-provider';
import { DisabledOpenLayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { ImageryMapSource } from '@ansyn/imagery/model/base-map-source-provider';

export const OpenLayerNotGeoRegisteredPlanetSourceProviderSourceType = 'NOT-GEO-REGISTERED-PLANET';

@ImageryMapSource({
	sourceType: OpenLayerNotGeoRegisteredPlanetSourceProviderSourceType,
	supported: [OpenlayersMapName, DisabledOpenLayersMapName]
})
export class OpenLayerNotGeoRegisteredPlanetSourceProvider extends OpenLayerPlanetSourceProvider {
}
