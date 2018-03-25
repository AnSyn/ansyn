import { LimitedArray } from '../utils/limited-array';
import { CaseRegionState, CaseTimeState } from '@ansyn/core';

export interface OverlaysPlanetFetchData extends LimitedArray {
	_links: {
		_first: string,
		_next: string,
		_self: string,
	},
	features: PlanetOverlay[],
	type: string
}
export interface OverlaysFetchData {
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

export class PlanetOverlay {
	_links: {
		_self: string,
		assets: string,
		thumbnail: string
	};
	_permissions: string[];
	geometry: GeoJSON.Polygon;
	id: string;
	properties: {
		acquired: string,
		anomalous_pixels: number,
		black_fill: number,
		cloud_cover: number,
		columns: number,
		epsg_code: number,
		grid_cell: string,
		ground_control: boolean,
		gsd: number,
		item_type: string,
		origin_x: number,
		origin_y: number,
		pixel_resolution: number,
		provider: string,
		published: string,
		rows: number,
		satellite_id: string,
		strip_id: string,
		sun_azimuth: number,
		sun_elevation: number,
		updated: string,
		usable_data: number,
		view_angle: number
	};
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
