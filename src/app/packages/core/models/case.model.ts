import { Position } from './position.model';
import { Overlay } from './overlay.model';

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

export interface CaseMapState {
	id: string;
	data: {
		position: Position,
		selectedOverlay?: Overlay
	};
	mapType: string;
}
export const defaultMapType = 'openLayersMap';
