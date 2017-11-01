import { Position } from './position.model';
import { Overlay } from './overlay.model';
import { ILayerTreeNodeRoot } from './layers/layer-tree-node-root';

export type Case = {
	readonly id?:string;
	name?:string;
	owner?:string;
	last_modified?:Date;
	state?: CaseState
};

export type CaseState = {
	selected_context_id?: string;
	maps?: CaseMapsState,
	time: CaseTimeState,
	facets?: CaseFacetsState,
	region: CaseRegionState,
	orientation: string,
	geoFilter: string,
	favoritesOverlays?: string[],
	dataLayers?: ILayerTreeNodeRoot[]	
};

export type CaseRegionState = any | GeoJSON.Feature<GeoJSON.Polygon> | GeoJSON.Point | GeoJSON.Polygon;

export type CaseTimeState = {
	type: string,
	from: string,
	to: string
};

export type CaseFacetsState = {
	filters: {fieldName: string, metadata: any}[];
}

export type CaseMapsState = {
	layouts_index: number,
	active_map_id: string,
	data: CaseMapState[]
};

export type OverlayDisplayMode = 'Hitmap' | 'Polygon' | 'None';

export interface CaseMapState {
	id: string;
	data: {
		position: Position,
		overlay?: Overlay,
		isAutoImageProcessingActive?: boolean,
		overlayDisplayMode?: OverlayDisplayMode
	};
	mapType: string;
};

export const defaultMapType = 'openLayersMap';
