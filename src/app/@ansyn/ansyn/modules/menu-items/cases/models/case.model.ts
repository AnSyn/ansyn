import { IDilutedOverlay, IOverlay } from '../../../overlays/models/overlay.model';
import { Feature, Point, Polygon } from 'geojson';
import { LayoutKey } from '@ansyn/map-facade';
import { FilterType } from '../../filters/models/filter-type';
import { ImageryMapPosition, IMapSettings, IMapSettingsData, IVisualizerEntity } from '@ansyn/imagery';
import { OverlayDisplayMode } from '../../tools/overlays-display-mode/overlays-display-mode.component';

export interface ICasePreview {
	creationTime: Date;
	id: string;
	name: string;
	owner?: string;
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
	facets?: ICaseFacetsState,
	region: CaseRegionState,
	contextEntities?: IContextEntity[],
	orientation: CaseOrientation,
	dataInputFilters: ICaseDataInputFiltersState,
	timeFilter: CaseTimeFilter,
	favoriteOverlays?: IDilutedOverlay[],
	miscOverlays?: IDilutedOverlaysHash[],
	removedOverlaysIds?: string[],
	removedOverlaysVisibility: boolean,
	presetOverlays?: IDilutedOverlay[],
	overlaysManualProcessArgs: IOverlaysManualProcessArgs,
	layers?: ICaseLayersState
}

export interface ICaseState extends IDilutedCaseState {
	favoriteOverlays?: IOverlay[];
	presetOverlays?: IOverlay[];
	miscOverlays?: IOverlaysHash[],
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

export interface ICaseSliderFilterMetadata {
	start: number;
	end: number;
}

export type CaseEnumFilterMetadata = string[];

export type CaseFilterMetadata = ICaseBooleanFilterMetadata | CaseEnumFilterMetadata | ICaseSliderFilterMetadata;

export interface ICaseFilter<T = CaseFilterMetadata> {
	type: FilterType;
	fieldName: string;
	metadata: T;
	positive?: boolean;
}

export interface ICaseFacetsState {
	filters?: ICaseFilter[];
	showOnlyFavorites?: boolean;
}

export interface ICaseLayersState {
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


export interface IDilutedCaseMapData extends IMapSettingsData {
	overlay?: IDilutedOverlay,
	isAutoImageProcessingActive?: boolean,
	overlayDisplayMode?: OverlayDisplayMode,
	imageManualProcessArgs?: ImageManualProcessArgs
}

export interface ICaseMapData extends IDilutedCaseMapData {
	overlay?: IOverlay,
}

export interface IDilutedCaseMapState extends IMapSettings {
	data: IDilutedCaseMapData;
}

export interface ICaseMapState extends IMapSettings {
	data: ICaseMapData;
}
