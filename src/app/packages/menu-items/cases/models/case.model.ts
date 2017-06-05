import { Position } from '@ansyn/core';

export type Case = {
	readonly id?:string;
	name?:string;
	owner?:string;
	last_modified?:Date;
	state?: CaseState
}

export type CaseState = {
	selected_overlays_ids?: string[];
	selected_context_id?: string;
	maps?: CaseMapsState,
	time: CaseTimeState,
	facets?: CaseFacetsState,
	region: GeoJSON.Point | GeoJSON.Polygon
}

export type CaseTimeState = {
	type:string,
	from: Date,
	to: Date
}
export type CaseFacetsState = {
	SensorName: string,
	SensorType: 'SAR' | 'VIS' | 'IR' | 'Satellite',
	Stereo: boolean,
	Resolution: number
}
export type CaseMapsState = {
	layouts_index: number,
	active_map_id: string,
	data: CaseMapState[]
}

export type CaseMapState = {
	id: string;
	data: {
		position: Position
	};
	mapType: string;
}

export const BaseSettings = {mapType: "openLayerMap"};
