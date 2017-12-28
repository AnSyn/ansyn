import { GeometryObject } from 'geojson';
import { LimitedArray } from '../utils/limited-array';

export interface OverlaysFetchData extends LimitedArray{
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
	northAngle? = 0; // radians
	approximateTransform?: any;
	csmState?: string;
	sourceType?: string;
	isFullOverlay: boolean;
	isGeoRegistered: boolean;
}

export interface OverlaysCriteria {
	to: string;
	from: string;
	polygon: GeometryObject;
	caseId?: string;
}

export interface OverlaySpecialObject {
	id: string;
	date: Date;
	shape: string; // this will be type soon or I will add another property for shapeType
}
