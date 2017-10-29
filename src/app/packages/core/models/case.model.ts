import { Position } from './position.model';
import { Overlay } from './overlay.model';
import { FeatureCollection } from 'geojson';

export interface Case {
	readonly id?: string;
	name?: string;
	owner?: string;
	lastModified?: Date;
	state?: CaseState;
}

export interface IContextEntity {
	id: string;
	featureJson: GeoJSON.Feature<any>;
	date: Date;
}

export interface CaseState {
	selectedContextId?: string;
	maps?: CaseMapsState,
	time: CaseTimeState,
	facets?: CaseFacetsState,
	region: CaseRegionState,
	contextEntities?: IContextEntity[],
	orientation: string,
	geoFilter: string,
	favoritesOverlays?: string[],
	annotationsLayer?: FeatureCollection<any> | string
}

export type CaseRegionState = any | GeoJSON.Feature<GeoJSON.Polygon> | GeoJSON.Point | GeoJSON.Polygon;

export interface CaseTimeState {
	type: string,
	from: string,
	to: string
}

export interface CaseFacetsState {
	filters: { fieldName: string, metadata: any }[];
	showOnlyFavorites?: boolean;
}

export interface CaseMapsState {
	layoutsIndex: number,
	activeMapId: string,
	data: CaseMapState[]
}

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
}

export const defaultMapType = 'openLayersMap';
