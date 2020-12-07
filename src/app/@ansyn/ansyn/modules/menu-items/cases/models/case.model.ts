import { IDilutedOverlay, IDilutedOverlaysHash, IOverlay, IOverlaysHash } from '../../../overlays/models/overlay.model';
import { Feature, MultiPolygon, Point, Polygon } from 'geojson';
import { LayoutKey } from '@ansyn/map-facade';
import { FilterType } from '../../../filters/models/filter-type';
import { IMapSettings, IMapSettingsData } from '@ansyn/imagery';

export interface ICasePreview {
	creationTime: Date;
	id: string;
	name?: string;
	selectedContextId?: string;
	autoSave?: boolean;
	schema?: 'case';
}

export interface ICase extends ICasePreview {
	state: ICaseState;
}

export interface IDilutedCase extends ICasePreview {
	state: ICaseState;
}

export type CaseOrientation = 'Align North' | 'User Perspective' | 'Imagery Perspective';
export type CaseTimeFilter = 'Start - End';


export enum CaseGeoFilter {
	PinPoint = 'Point',
	Polygon = 'Polygon',
	ScreenView = 'ScreenView'
}

export interface IImageManualProcessArgs {
	Brightness?: number;
	Contrast?: number;
	Gamma?: number;
	Saturation?: number;
	Sharpness?: number;
}

export interface IOverlaysManualProcessArgs {
	[key: string]: IImageManualProcessArgs;
}

export interface ITranslationData {
	dragged?: boolean;
	offset: [number, number];
}

export interface IOverlaysTranslationData {
	[key: string]: ITranslationData;
}

export interface IOverlaysScannedAreaData {
	[key: string]: MultiPolygon;
}

export interface IDilutedCaseState {
	maps?: IDilutedCaseMapsState;
	time: ICaseTimeState;
	facets?: ICaseFacetsState;
	region: CaseRegionState;
	dataInputFilters: ICaseDataInputFiltersState;
	favoriteOverlays?: IDilutedOverlay[];
	miscOverlays?: IDilutedOverlaysHash;
	overlaysManualProcessArgs: IOverlaysManualProcessArgs;
	overlaysTranslationData: IOverlaysTranslationData;
	overlaysScannedAreaData?: IOverlaysScannedAreaData;
	layers?: ICaseLayersState;
}

export interface ICaseState extends IDilutedCaseState {

	favoriteOverlays?: IOverlay[];
	miscOverlays?: IOverlaysHash;
	maps?: ICaseMapsState;
}

export type CaseRegionState = any | Feature<Polygon | Point> | Point | Polygon | Position;

export interface IDataInputFilterValue {
	providerName: string;
	sensorType: string;
	sensorName?: string;
}

export interface ICaseDataInputFiltersState {
	fullyChecked?: boolean;
	filters: IDataInputFilterValue[];
	customFiltersSensor?: string[]; // for context
}

export interface ICaseTimeState {
	from: Date;
	to: Date;
}

export interface ICaseBooleanFilterMetadata {
	displayTrue: boolean;
	isDisplayTrueDisabled: boolean;
	displayFalse: boolean;
	isDisplayFalseDisabled: boolean;
}

export interface ICaseSliderFilterMetadata {
	start: number;
	end: number;
}

export interface ICaseEnumFilterMetadata {
	unCheckedEnums: string[];
	disabledEnums: string[];
}

export type CaseArrayFilterMetadata = [string, boolean][];

export type CaseFilterMetadata =
	ICaseBooleanFilterMetadata
	| ICaseEnumFilterMetadata
	| ICaseSliderFilterMetadata
	| CaseArrayFilterMetadata;

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
	activeLayersIds: string[];
}

export interface IDilutedCaseMapsState {
	layout: LayoutKey;
	activeMapId: string;
	data: IDilutedCaseMapState[];
}

export interface ICaseMapsState extends IDilutedCaseMapsState {
	data: ICaseMapState[];
}

export interface IDilutedCaseMapData extends IMapSettingsData {
	overlay?: IDilutedOverlay;
	isAutoImageProcessingActive?: boolean;
	imageManualProcessArgs?: IImageManualProcessArgs;
	translationData?: ITranslationData;
}

export interface ICaseMapData extends IDilutedCaseMapData {
	overlay?: IOverlay;
}

export interface IDilutedCaseMapState extends IMapSettings {
	data: IDilutedCaseMapData;
}

export interface ICaseMapState extends IMapSettings {
	data: ICaseMapData;
}


