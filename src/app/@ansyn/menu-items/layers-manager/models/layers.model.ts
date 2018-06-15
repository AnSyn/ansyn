import { Entity } from '@ansyn/core/services/storage/storage.service';

export enum LayerType {
	static = 'Static',
	dynamic = 'Dynamic',
	complex = 'Complex'
}

export interface LayersContainer extends Entity {
	id: string;
	name: string;
	type: LayerType;
	dataLayerContainers: any[];
}
