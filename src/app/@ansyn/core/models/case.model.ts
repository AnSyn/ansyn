import { ICaseMapPosition } from './case-map-position.model';
import { IOverlay } from './overlay.model';
import { Feature, FeatureCollection, Point, Polygon } from 'geojson';
import { IEntity } from '../services/storage/storage.service';
import { IVisualizerEntity } from './visualizers/visualizers-entity';
import { LayoutKey } from './layout-options.model';
import { IDilutedOverlay } from './overlay.model';

export interface ICasePreview extends IEntity {
	creationTime: Date;
	id: string;
	name: string;
	owner: string;
	lastModified: Date;
	selectedContextId?: string;
	autoSave: boolean;
}

export interface ICase extends ICasePreview {
	state: ICaseState;
}

export interface IDilutedCase extends ICasePreview {
	state: ICaseState;
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

export interface IOverlaysManualProcessArgs {
	[key: string]: ImageManualProcessArgs
}

export interface IDilutedCaseState {
	maps?: IDilutedCaseMapsState,
	time: ICaseTimeState,
	noInitialSearch?: boolean,
	facets?: ICaseFacetsState,
	region: CaseRegionState,
	contextEntities?: IContextEntity[],
	orientation: CaseOrientation,
	dataInputFilters: ICaseDataInputFiltersState,
	timeFilter: CaseTimeFilter,
	favoriteOverlays?: IDilutedOverlay[],
	overlaysManualProcessArgs: IOverlaysManualProcessArgs,
	layers?: ICaseLayersState
}

export interface ICaseState extends IDilutedCaseState {
	favoriteOverlays?: IOverlay[];
	maps?: ICaseMapsState;
}

export type CaseRegionState = any | Feature<Polygon> | Point | Polygon | Position;

export interface IDataInputFilterValue {
	providerName: string,
	sensorType: string,
	sensorName: string
}

export interface ICaseDataInputFiltersState {
	fullyChecked: boolean,
	filters: IDataInputFilterValue[],
	active: boolean
}

export interface ICaseTimeState {
	type: 'absolute',
	from: Date,
	to: Date
}

export interface ICaseBooleanFilterMetadata {
	displayTrue: boolean;
	displayFalse: boolean;
}

export type CaseEnumFilterMetadata = string[];

export type CaseFilterMetadata = ICaseBooleanFilterMetadata | CaseEnumFilterMetadata;

export enum FilterType { Enum = 'Enum', Slider = 'Slider', Boolean = 'Boolean'}

export interface ICaseFilter {
	type: FilterType;
	fieldName: string;
	metadata: CaseFilterMetadata;
}

export type CaseFilters = ICaseFilter[];

export interface ICaseFacetsState {
	filters?: CaseFilters;
	showOnlyFavorites?: boolean;
}

export interface ICaseLayersState {
	annotationsLayer: FeatureCollection<any>,
	displayAnnotationsLayer?: boolean,
	activeLayersIds: string[]
}

export interface IDilutedCaseMapsState {
	layout: LayoutKey;
	activeMapId: string;
	data: IDilutedCaseMapState[];
}

export interface ICaseMapsState extends IDilutedCaseMapsState {
	data: ICaseMapState[]
}

export type OverlayDisplayMode = 'Heatmap' | 'Polygon' | 'None';

export interface IDilutedCaseMapData {
	position: ICaseMapPosition,
	overlay?: IDilutedOverlay,
	isAutoImageProcessingActive?: boolean,
	overlayDisplayMode?: OverlayDisplayMode,
	imageManualProcessArgs?: ImageManualProcessArgs
}

export interface ICaseMapData extends IDilutedCaseMapData {
	overlay?: IOverlay,
}

export interface IDilutedCaseMapState {
	id: string;
	data: IDilutedCaseMapData;
	mapType: string;
	sourceType: string;
	flags: {
		displayLayers?: boolean
	};
}

export interface ICaseMapState extends IDilutedCaseMapState {
	data: ICaseMapData;
}
