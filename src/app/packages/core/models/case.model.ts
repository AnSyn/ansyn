import { CaseMapPosition } from './case-map-position.model';
import { Overlay } from './overlay.model';
import { FeatureCollection } from 'geojson';
import { IVisualizerEntity } from '@ansyn/imagery/model/imap-visualizer';

export interface Case {
	readonly id?: string;
	name?: string;
	owner?: string;
	lastModified?: Date;
	state?: CaseState;
}

export interface IContextEntity extends IVisualizerEntity {
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
	overlaysManualProcessArgs: Object,
	layers?: CaseLayersState
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

export interface CaseLayersState {
	annotationsLayer?: FeatureCollection<any> | string,
	displayAnnotationsLayer?: boolean
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
		position: CaseMapPosition,
		overlay?: Overlay,
		isAutoImageProcessingActive?: boolean,
		overlayDisplayMode?: OverlayDisplayMode
	};
	progress: number;
	mapType: string;
	flags: {
		layers?: boolean
	};
}

export const defaultMapType = 'openLayersMap';
