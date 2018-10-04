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

export interface IOverlay extends IDilutedOverlay {
	footprint?: any; // @TODO add type geojson multipoligon,
	sensorType?: string;
	sensorName?: string;
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
	isGeoRegistered: boolean;
	tag?: any; // original metadata
	projection?: string;
	token?: string;
	catalogID?: string,
}

export class Overlay implements IOverlay {
	footprint?: any; // @TODO add type geojson multipoligon,
	sensorType = 'Unknown';
	sensorName = 'Unknown';
	channel?: number;
	bestResolution?: number;
	cloudCoverage = 1;
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
	isGeoRegistered: boolean;
	tag?: any; // original metadata
	projection?: string;
	id: string;
	sourceType: string;

	constructor({
					sensorType = 'Unknown',
					sensorName = 'Unknown',
					cloudCoverage = 1,
					projection = 'EPSG:3857',
					...restProps
				}: Partial<IOverlay>) {
		this.sensorType = sensorType;
		this.sensorName = sensorName;
		this.cloudCoverage = cloudCoverage;
		this.projection = projection;
		Object.entries(restProps).forEach(([key, value]) => {
			this[key] = value;
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

export interface IOverlaySpecialObject {
	id: string;
	date: Date;
	shape: string; // this will be type soon or I will add another property for shapeType
}
