import { Entity } from '@ansyn/core/services/storage/storage.service';

export enum LayerType {
	static = 'Static',
	dynamic = 'Dynamic',
	complex = 'Complex'
}

export enum layerPluginType {
	OSM = 'OSM',
	geoJson = 'geoJson'
}

export interface ILayer extends Entity {
	url: string;
	name: string;
	type: LayerType;
	layerPluginType: layerPluginType;
}
