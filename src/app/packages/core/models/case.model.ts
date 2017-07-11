import { Position } from '@ansyn/core';

export type Case = {
	readonly id?:string;
	name?:string;
	owner?:string;
	last_modified?:Date;
	state?: CaseState
}

export type CaseState = {
	selected_context_id?: string;
	maps?: CaseMapsState,
	time: CaseTimeState,
	facets?: CaseFacetsState,
	region: GeoJSON.Point | GeoJSON.Polygon
}

export type CaseTimeState = {
	type:string,
	from: string,
	to: string
}
export type CaseFacetsState = {
	filters: {fieldName: string, metadata: any}[]
}

export type CaseMapsState = {
	layouts_index: number,
	active_map_id: string,
	data: CaseMapState[]
}

export type CaseMapState = {
	id: string;
	data: {
		position: Position,
		selectedOverlay?: {id: string, name: string}
	};
	mapType: string;
}
export const defaultMapType = 'openLayersMap';
export const BaseSettings = {mapType: defaultMapType};
