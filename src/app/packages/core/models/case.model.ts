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

export type CaseOrientation = 'Align North' | 'User Perspective' | 'Imagery Perspective'
export type CaseTimeFilter = 'Start - End';
export type CaseGeoFilter = 'Pin-Point';

export interface ImageManualProcessArgs {
	Brightness: number
	Contrast: number
	Gamma: number
	Saturation: number
	Sharpness: number
}

export interface CaseState {
	selectedContextId?: string;
	maps?: CaseMapsState,
	time: CaseTimeState,
	facets?: CaseFacetsState,
	region: CaseRegionState,
	contextEntities?: IContextEntity[],
	orientation: CaseOrientation,
	timeFilter: CaseTimeFilter,
	geoFilter: CaseGeoFilter,
	favoriteOverlays?: Overlay[],
	overlaysManualProcessArgs: { [key: string]: ImageManualProcessArgs } | {},
	layers?: CaseLayersState
}

export type CaseRegionState = any | GeoJSON.Feature<GeoJSON.Polygon> | GeoJSON.Point | GeoJSON.Polygon | GeoJSON.Position;

export interface CaseTimeState {
	type: string,
	from: string,
	to: string
}

export interface CaseBooleanFilterMetadata {
	displayTrue: boolean;
	displayFalse: boolean;
}

export type CaseFilterMetadata = CaseBooleanFilterMetadata | any;

export interface CaseFilter {
	fieldName: string;
	metadata: CaseFilterMetadata;
}

export interface CaseFacetsState {
	filters: CaseFilter[];
	showOnlyFavorites?: boolean;
}

export interface CaseLayersState {
	annotationsLayer: FeatureCollection<any>,
	displayAnnotationsLayer?: boolean
}

export interface CaseMapsState {
	layoutsIndex: number,
	activeMapId: string,
	data: CaseMapState[]
}

export type OverlayDisplayMode = 'Hitmap' | 'Polygon' | 'None';

export interface CaseMapData {
	position: CaseMapPosition,
	overlay?: Overlay,
	isAutoImageProcessingActive?: boolean,
	overlayDisplayMode?: OverlayDisplayMode
}

export interface CaseMapState {
	id: string;
	data: CaseMapData;
	progress: number;
	mapType: string;
	flags: {
		layers?: boolean
	};
}

export const defaultMapType = 'openLayersMap';
