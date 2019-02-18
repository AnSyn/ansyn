import { CaseRegionState, ICaseDataInputFiltersState, ICaseTimeState } from './case.model';

export interface IOverlaysFetchData {
	data: IOverlay[],
	// number of overlays removed from total overlays (according to config)
	limited: number,
	errors?: Error[]
}

export interface IDilutedOverlay {
	id: string;
	sourceType?: string;
}

export interface IPendingOverlay {
	overlay: IOverlay;
	extent?: any;
}

export enum GeoRegisteration {
	isGeoRegistered = 'isGeoRegistered',
	notGeoRegistered = 'notGeoRegistered',
	poorGeoRegistered = 'poorGeoRegistered',
}

export interface IOverlay extends IDilutedOverlay {
	footprint?: any; // @TODO add type geojson multipoligon,
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
	catalogID?: string,
}

export class Overlay implements IOverlay {
	static UNKNOWN_NAME = 'Unknown';
	static DEFAULT_CLOUD_COVERAGE = 1;
	static DEFAULT_PROJECTION = 'EPSG:3857';
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
	dataInputFilters?: ICaseDataInputFiltersState;
}

export interface IOverlaysCriteriaOptions {
	noInitialSearch?: boolean;
}


export interface IOverlayDrop {
	id: string;
	date: Date;
	shape?: string;
}

export interface IOverlaySpecialObject extends IOverlayDrop {
	shape: string; // this will be type soon or I will add another property for shapeType
}
