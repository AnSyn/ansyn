import { CaseRegionState, ICaseTimeState } from '../../menu-items/cases/models/case.model';
import { LineString, MultiPolygon, Point } from 'geojson';
import { EPSG_3857 } from '@ansyn/imagery';
import { IAdvancedSearchParameter } from '../../status-bar/models/statusBar-config.model';

export const fourViewsConfig = 'fourViewsConfig';

export interface IFourViewsConfig {
	sensors: string[];
	storageLimitPerAngle: number;
	active: boolean;
}

export interface IFourViews {
	firstAngleOverlays?: IOverlay[]; // 0 < angle < 90
	secondAngleOverlays?: IOverlay[]; // 90 < angle < 180
	thirdAngleOverlays?: IOverlay[]; // 180 < angle < 270
	fourthAngleOverlays?: IOverlay[]; // 270 < angle < 360
}

export interface IOverlayError {
	message: string,
	sourceType?: string
}

export interface IOverlaysFetchData {
	data: IOverlay[],
	// number of overlays removed from total overlays (according to config)
	limited: number,
	errors?: IOverlayError[]
}

export interface IDilutedOverlay {
	id: string;
	sourceType?: string;
}

export interface IOverlaysHash {
	[key: string]: IOverlay;
}

export interface IDilutedOverlaysHash {
	[key: string]: IDilutedOverlay;
}

export enum GeoRegisteration {
	geoRegistered = 'geoRegistered',
	notGeoRegistered = 'notGeoRegistered',
	originRegistration = 'originRegistration'
}

export enum GeoRegisterationOptions {
	GeoRegistered = 'Geo Registered',
	NotGeoRegistered = 'Not Geo Registered',
}

export enum PhotoAngle {
	diagonal = 'diagonal',
	vertical = 'vertical'
}

export enum RegionContainment {
	unknown = 'unknown',
	contained = 'contained',
	notContained = 'notContained',
	intersect = 'intersect'
}

export interface IOverlay extends IDilutedOverlay {
	footprint?: Point | MultiPolygon | LineString; // @TODO: change to GeoJsonObject
	sensorType?: string;
	sensorName?: string;
	creditName?: string;
	channel?: number;
	bestResolution?: number;
	cloudCoverage?: number;
	isStereo?: boolean;
	name: string;
	imageUrl?: string;
	baseImageUrl?: string;
	thumbnailUrl?: string;
	photoTime: string;
	date: Date;
	azimuth: number; // radians
	approximateTransform?: any;
	csmState?: string;
	isGeoRegistered: GeoRegisteration;
	tag?: any; // original metadata
	projection?: string;
	token?: string;
	catalogID?: string;
	photoAngle?: PhotoAngle;
	sensorLocation?: Point;
	icon?: string;
	containedInSearchPolygon?: RegionContainment;
	resolution?: number;
}

export class Overlay implements IOverlay {
	static UNKNOWN_NAME = 'Unknown';
	static DEFAULT_CLOUD_COVERAGE = 1;
	static DEFAULT_PROJECTION = EPSG_3857;
	static DEFAULT_AZIMUTH = 0;

	footprint?: any;
	sensorType = Overlay.UNKNOWN_NAME;
	sensorName = Overlay.UNKNOWN_NAME;
	channel?: number;
	bestResolution?: number;
	cloudCoverage = Overlay.DEFAULT_CLOUD_COVERAGE;
	isStereo?: boolean;
	name: string;
	imageUrl?: string;
	baseImageUrl?: string;
	thumbnailUrl?: string;
	photoTime: string;
	date: Date;
	azimuth: number = Overlay.DEFAULT_AZIMUTH; // radians
	approximateTransform?: any;
	csmState?: string;
	isGeoRegistered: GeoRegisteration;
	tag?: any; // original metadata
	projection?: string = Overlay.DEFAULT_PROJECTION;
	id: string;
	sourceType: string;
	photoAngle: PhotoAngle = PhotoAngle.vertical;
	containedInSearchPolygon: RegionContainment = RegionContainment.unknown;

	constructor(overlayProps: Partial<IOverlay>) {
		Object.entries(overlayProps).forEach(([key, value]) => {
			if (value) {
				this[key] = value;
			}
		});
	}
}

export interface IOverlaysCriteria {
	time?: ICaseTimeState;
	region?: CaseRegionState;
	advancedSearchParameters?: IAdvancedSearchParameter;
}

export interface IResolutionRange {
	lowValue: number;
	highValue: number;
}
export interface IOverlaysCriteriaOptions {
	noInitialSearch?: boolean;
	runSecondSearch?: boolean;
}


export interface IOverlayDrop {
	id: string;
	date: Date;
	shape?: string;
	sensorName?: string;
	icon?: any;
	favorite?: boolean;
	resolution?: number;
}

export interface IOverlaySpecialObject extends IOverlayDrop {
	shape: string; // this will be type soon or I will add another property for shapeType
}
