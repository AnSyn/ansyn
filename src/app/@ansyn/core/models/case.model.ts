import { CaseMapPosition } from './case-map-position.model';
import { Overlay } from './overlay.model';
import { Feature, FeatureCollection, Point, Polygon } from 'geojson';
import { Entity } from '@ansyn/core/services/storage/storage.service';
import { IVisualizerEntity } from '@ansyn/imagery/model/base-imagery-visualizer';
import { LayoutKey } from '@ansyn/core/models/layout-options.model';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';

export interface CasePreview extends Entity {
	creationTime: Date;
	id: string;
	name: string;
	owner: string;
	lastModified: Date;
	selectedContextId?: string;
}

export interface Case extends CasePreview {
	state: CaseState;
}

export interface IContextEntity extends IVisualizerEntity {
	date: Date;
}

export type CaseOrientation = 'Align North' | 'User Perspective' | 'Imagery Perspective';
export type CaseTimeFilter = 'Start - End';

export enum CaseGeoFilter {
	PinPoint = 'Point',
	Polygon = 'Polygon'
}

export interface ImageManualProcessArgs {
	Brightness?: number
	Contrast?: number
	Gamma?: number
	Saturation?: number
	Sharpness?: number
}

export interface OverlaysManualProcessArgs {
	[key: string]: ImageManualProcessArgs
}

export interface CaseState {
	maps?: CaseMapsState,
	time: CaseTimeState,
	facets?: CaseFacetsState,
	region: CaseRegionState,
	contextEntities?: IContextEntity[],
	orientation: CaseOrientation,
	timeFilter: CaseTimeFilter,
	geoFilter: CaseGeoFilter,
	favoriteOverlays?: Overlay[],
	overlaysManualProcessArgs: OverlaysManualProcessArgs,
	layers?: CaseLayersState
}

export type CaseRegionState = any | Feature<Polygon> | Point | Polygon | Position;

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

export enum FilterType { Enum = 'Enum', Slider = 'Slider', Boolean = 'Boolean'};

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

export const defaultMapType = OpenlayersMapName;
