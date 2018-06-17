import { Entity } from '@ansyn/core/services/storage/storage.service';
import { Overlay } from '@ansyn/core/models/overlay.model';

export enum LayerType {
	static = 'Static',
	dynamic = 'Dynamic',
	complex = 'Complex'
}

export interface Layer extends Entity {
	url: string;
	id: string;
	name: string;
	type: LayerType;
	dataLayerContainers: any[];
}
