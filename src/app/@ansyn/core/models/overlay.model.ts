import { CaseRegionState, CaseTimeState } from '@ansyn/core';

export interface OverlaysFetchData {
	data: Overlay[],
	// number of overlays removed from total overlays (according to config)
	limited: number,
	errors?: Error[]
}

export class Overlay {
	id: string;
	footprint?: any; // @TODO add type geojson multipoligon,
	sensorType?: string;
	sensorName?: string;
	channel?: string;
	bestResolution?: number;
	isStereo?: boolean;
	name: string;
	imageUrl?: string;
	thumbnailUrl?: string;
	photoTime: string;
	date: Date;
	azimuth: number; // radians
	approximateTransform?: any;
	csmState?: string;
	sourceType?: string;
	isGeoRegistered: boolean;
}

export interface OverlaysCriteria {
	time?: CaseTimeState;
	region?: CaseRegionState;
	realPolygon?: boolean;
}

export interface OverlaySpecialObject {
	id: string;
	date: Date;
	shape: string; // this will be type soon or I will add another property for shapeType
}
