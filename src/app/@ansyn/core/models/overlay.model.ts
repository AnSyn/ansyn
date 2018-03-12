import { LimitedArray } from '../utils/limited-array';
import { CaseRegionState, CaseTimeState } from '@ansyn/core';
import { GeoJsonObject } from "geojson";

export interface OverlaysOpenAerialFetchData extends LimitedArray{
	meta: {
		provided_by: string,
		license: string,
		website: string,
		page: number,
		limit: number,
		found: number
	},
	results: OpenAerialOverlay[]
}
export interface OverlaysFetchData{
	data: Overlay[],
	// number of overlays removed from total overlays (according to config)
	limited: number
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

export class OpenAerialOverlay {
	_id: string;
	uuid: string;
	_v: number;
	title: string;
	projection: string;
	footprint: string;
	gsd: number;
	file_size: number;
	acquisition_start: string;
	acquisition_end: string;
	platform: string;
	provider: string;
	contact: string;
	imageUrl?: string;
	properties: {
		thumbnail?: string;
		tms?: string;
		wmts?: string;
		sensor?: string;
	};
	meta_uri: string;
	geojson: GeoJsonObject;
}

export interface OverlaysCriteria {
	time?: CaseTimeState;
	region?: CaseRegionState;
}

export interface OverlaySpecialObject {
	id: string;
	date: Date;
	shape: string; // this will be type soon or I will add another property for shapeType
}
