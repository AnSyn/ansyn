import {
	IDilutedOverlay,
	IDilutedOverlaysHash,
	IOverlay,
	IOverlaysHash
} from '../../../overlays/models/overlay.model';
import { Feature, MultiPolygon, Point, Polygon, Position } from 'geojson';
import { IFourViewsData, LayoutKey } from '@ansyn/map-facade';
import { FilterType } from '../../../filters/models/filter-type';
import { IMapSettings, IMapSettingsData } from '@ansyn/imagery';
import { IAdvancedSearchParameter } from '../../../status-bar/models/statusBar-config.model';
import { IMeasureData } from '../../../status-bar/components/tools/models/tools.model';

export interface ICasePreview {
	creationTime: Date;
	id: string;
	name?: string;
	selectedContextId?: string;
	autoSave?: boolean;
	schema?: 'case';
	shared?: boolean;
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

export interface IOverlayImageProcess {
	isAuto: boolean;
	manuelArgs: IImageManualProcessArgs
}

export interface IImageManualProcessArgs {
	Brightness?: number;
	Contrast?: number;
	Gamma?: number;
	Saturation?: number;
	Sharpness?: number;
}

export interface IOverlaysImageProcess {
	[key: string]: IOverlayImageProcess;
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
	favoriteOverlays?: IDilutedOverlay[];
	miscOverlays?: IDilutedOverlaysHash;
	overlaysImageProcess: IOverlaysImageProcess;
	overlaysTranslationData: IOverlaysTranslationData;
	overlaysScannedAreaData?: IOverlaysScannedAreaData;
	layers?: ICaseLayersState;
	advancedSearchParameters?: IAdvancedSearchParameter;
	runSecondSearch?: boolean;
	fourViewsMode?: IFourViewsData;
}

export interface ICaseState extends IDilutedCaseState {

	favoriteOverlays?: IOverlay[];
	miscOverlays?: IOverlaysHash;
	maps?: ICaseMapsState;
}

// TODO: remove any type
export type CaseRegionState = any | Feature<Polygon | Point> | Point | Polygon;

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
	measuresData?: IMeasureData;
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


