import { IEntity } from '@ansyn/core';

export enum LayerType {
	static = 'Static',
	annotation = 'Annotation',
	dynamic = 'Dynamic',
	complex = 'Complex'
}
export type layerPluginType = string | layerPluginTypeEnum;

export enum layerPluginTypeEnum {
	ARCGIS = 'ARCGIS',
	OSM = 'OSM',
	geoJson = 'geoJson',
	Annotations = 'Annotations'
}

export interface ILayer extends IEntity {
	url?: string;
	name: string;
	type: LayerType;
	layerPluginType: layerPluginTypeEnum;
	data?: any;
	caseId?: string;
	extent?: [number, number, number, number];
}
