import { MapPosition } from './map-position';
/**
 * Created by AsafMasa on 25/04/2017.
 */
export class ImageryComponentSettings {
	id: string;
	data: {
		position: MapPosition,
		selectedOverlay?: {id: string, name: string, imageUrl: string, sourceType: string}
	};
	mapType: string;
}
