import { Injectable } from '@angular/core';
import { OpenLayerPlanetSourceProvider } from './open-layers-planet-source-provider';

export const OpenLayerNotGeoRegisteredPlanetSourceProviderSourceType = 'NOT-GEO-REGISTERED-PLANET';

@Injectable()
export class OpenLayerNotGeoRegisteredPlanetSourceProvider extends OpenLayerPlanetSourceProvider {
	public sourceType = OpenLayerNotGeoRegisteredPlanetSourceProviderSourceType;
}
