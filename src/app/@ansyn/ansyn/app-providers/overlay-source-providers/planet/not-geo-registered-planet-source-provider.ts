import { Injectable } from '@angular/core';
import { IOverlay } from '@ansyn/core';
import { PlanetSourceProvider } from './planet-source-provider';
import { PlanetOverlay } from './planet.model';

export const NotGeoRegisteredPlanetOverlaySourceType = 'NOT-GEO-REGISTERED-PLANET';

@Injectable()
export class NotGeoRegisteredPlaneSourceProvider extends PlanetSourceProvider {
	sourceType = NotGeoRegisteredPlanetOverlaySourceType;

	protected parseData(element: PlanetOverlay): IOverlay {
		const result = super.parseData(element);
		result.isGeoRegistered = false;
		return result;
	}
}
