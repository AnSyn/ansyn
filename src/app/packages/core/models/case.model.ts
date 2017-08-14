import { Position } from './position.model';
import { Overlay } from './overlay.model';

export type Case = {
	readonly id?: string;
	name?: string;
	owner?: string;
	last_modified?: Date;
	state?: CaseState;
};

export interface IContextEntity {
	id: string;
	footprint: GeoJSON.Feature<any>;
	date: Date;
}

export type CaseState = {
	selected_context_id?: string;
	maps?: CaseMapsState,
	time: CaseTimeState,
	facets?: CaseFacetsState,
	region: CaseRegionState,
	contextEntities?: IContextEntity[],
	orientation: string,
	geoFilter: string,
	favoritesOverlays?: string[]
};

export type CaseRegionState = any | GeoJSON.Feature<GeoJSON.Polygon> | GeoJSON.Point | GeoJSON.Polygon;

export type CaseTimeState = {
	type: string,
	from: string,
	to: string
};

export type CaseFacetsState = {
	filters: {fieldName: string, metadata: any}[];
	showOnlyFavorites?: boolean;
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
