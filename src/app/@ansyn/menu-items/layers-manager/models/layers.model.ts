import { Entity } from '@ansyn/core/services/storage/storage.service';

export enum LayerType {
	static = 'Static',
	dynamic = 'Dynamic',
	complex = 'Complex'
}

export interface Layer extends Entity {
	url: string;
	name: string;
	type: LayerType;
}
