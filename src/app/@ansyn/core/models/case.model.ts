import { CaseMapPosition } from './case-map-position.model';
import { Overlay } from './overlay.model';
import { Feature, FeatureCollection, Point, Polygon } from 'geojson';
import { Entity } from '../services/storage/storage.service';
import { IVisualizerEntity } from './visualizers/visualizers-entity';
import { LayoutKey } from './layout-options.model';
import { DilutedOverlay } from './overlay.model';

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

export interface DilutedCase extends CasePreview {
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

export interface DilutedCaseState {
	maps?: DilutedCaseMapsState,
	time: CaseTimeState,
	facets?: CaseFacetsState,
	region: CaseRegionState,
	contextEntities?: IContextEntity[],
	orientation: CaseOrientation,
	dataInputFilters: CaseDataInputFiltersState,
	timeFilter: CaseTimeFilter,
	favoriteOverlays?: DilutedOverlay[],
	overlaysManualProcessArgs: OverlaysManualProcessArgs,
	layers?: CaseLayersState
}

export interface CaseState extends DilutedCaseState {
	favoriteOverlays?: Overlay[];
	maps?: CaseMapsState;
}

export type CaseRegionState = any | Feature<Polygon> | Point | Polygon | Position;

export interface DataInputFilterValue {
	providerName: string,
	sensorType: string,
	sensorName: string
}

export interface CaseDataInputFiltersState {
	fullyChecked: boolean,
	filters: DataInputFilterValue[],
	active: boolean
}

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
	displayAnnotationsLayer?: boolean,
	activeLayersIds: string[]
}

export interface DilutedCaseMapsState {
	layout: LayoutKey;
	activeMapId: string;
	data: DilutedCaseMapState[];
}

export interface CaseMapsState extends DilutedCaseMapsState {
	data: CaseMapState[]
}

export type OverlayDisplayMode = 'Heatmap' | 'Polygon' | 'None';

export interface DilutedCaseMapData {
	position: CaseMapPosition,
	overlay?: DilutedOverlay,
	isAutoImageProcessingActive?: boolean,
	overlayDisplayMode?: OverlayDisplayMode,
	imageManualProcessArgs?: ImageManualProcessArgs
}

export interface CaseMapData extends DilutedCaseMapData {
	overlay?: Overlay,
}

export interface DilutedCaseMapState {
	id: string;
	data: DilutedCaseMapData;
	mapType: string;
	flags: {
		layers?: boolean
	};
}

export interface CaseMapState extends DilutedCaseMapState {
	data: CaseMapData;
}

export const defaultMapType = 'openLayersMap';
