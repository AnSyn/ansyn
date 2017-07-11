import { MapPosition } from './map-position';
import { CaseMapState, Overlay } from '@ansyn/core/models';

export class ImageryComponentSettings implements CaseMapState{
	id: string;
	data: {
		position: MapPosition,
		selectedOverlay?: Overlay;
	};
	mapType: string;
}
