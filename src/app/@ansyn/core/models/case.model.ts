import { CaseMapPosition } from './case-map-position.model';
import { Overlay } from './overlay.model';
import { FeatureCollection } from 'geojson';
import { IVisualizerEntity } from '@ansyn/imagery/model/base-imagery-visualizer';
import { LayoutKey } from '@ansyn/core';

export interface Case {
	id?: string;
	name?: string;
	owner?: string;
	lastModified?: Date;
	state?: CaseState;
	creationTime?: Date;
}

export interface IContextEntity extends IVisualizerEntity {
	date: Date;
}

export type CaseOrientation = 'Align North' | 'User Perspective' | 'Imagery Perspective';
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
	type: 'absolute',
	from: Date,
	to: Date
}

export interface CaseBooleanFilterMetadata {
	displayTrue: boolean;
	displayFalse: boolean;
}

export type CaseEnumFilterMetadata = string[];

export type CaseFilterMetadata = CaseBooleanFilterMetadata | CaseEnumFilterMetadata;

export type FilterType = 'Enum' | 'Slider' | 'Boolean';

export interface CaseFilter {
	type: FilterType;
	fieldName: string;
	metadata: CaseFilterMetadata;
}

export type CaseFilters = CaseFilter[];

export interface CaseFacetsState {
	filters?: CaseFilters;
	showOnlyFavorites?: boolean;
}

export interface CaseLayersState {
	annotationsLayer: FeatureCollection<any>,
	displayAnnotationsLayer?: boolean
}

export interface CaseMapsState {
	layout: LayoutKey,
	activeMapId: string,
	data: CaseMapState[]
}

export type OverlayDisplayMode = 'Heatmap' | 'Polygon' | 'None';

export interface CaseMapData {
	position: CaseMapPosition,
	overlay?: Overlay,
	isAutoImageProcessingActive?: boolean,
	overlayDisplayMode?: OverlayDisplayMode,
	imageManualProcessArgs?: ImageManualProcessArgs
}

export interface CaseMapState {
	id: string;
	data: CaseMapData;
	mapType: string;
	flags: {
		layers?: boolean
	};
}

export const defaultMapType = 'openLayersMap';
