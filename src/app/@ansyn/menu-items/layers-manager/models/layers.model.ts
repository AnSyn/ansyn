import { IEntity } from '@ansyn/core/services/storage/storage.service';

export enum LayerType {
	static = 'Static',
	annotation = 'Annotation',
	dynamic = 'Dynamic',
	complex = 'Complex'
}

export enum layerPluginType {
	OSM = 'OSM',
	geoJson = 'geoJson',
	Annotations = 'Annotations'
}

export interface ILayer extends IEntity {
	url?: string;
	name: string;
	type: LayerType;
	layerPluginType: layerPluginType;
	data?: any;
}
