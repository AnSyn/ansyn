import { Injectable } from '@angular/core';
import { PlanetSourceProvider } from '@ansyn/ansyn/app-providers/overlay-source-providers/planet/planet-source-provider';
import { PlanetOverlay } from '@ansyn/ansyn/app-providers/overlay-source-providers/planet/planet.model';
import { Overlay } from '@ansyn/core/models/overlay.model';

export const NotGeoRegisteredPlanetOverlaySourceType = 'NOT-GEO-REGISTERED-PLANET';

@Injectable()
export class NotGeoRegisteredPlaneSourceProvider extends PlanetSourceProvider {
	sourceType = NotGeoRegisteredPlanetOverlaySourceType;

	protected parseData(element: PlanetOverlay): Overlay {
		const result = super.parseData(element);
		result.isGeoRegistered = false;
		return result;
	}
}
