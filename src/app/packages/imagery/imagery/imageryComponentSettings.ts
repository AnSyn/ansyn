import { MapSettings } from './mapSettings';
import { Position } from '@ansyn/core';
/**
 * Created by AsafMasa on 25/04/2017.
 */
export class ImageryComponentSettings {
	id: string;
	data: {
		position: Position
	};
	settings: MapSettings[];
}
