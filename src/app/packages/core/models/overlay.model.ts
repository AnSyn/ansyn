/**
 * Created by ohad1 on 02/04/2017.
 */


import { GeometryObject } from 'geojson';

export class Overlay {
	id: string;
	footprint?: any;//@todo add type geojson_multipoligon,
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
	azimuth: number; //radians
	approximateTransform?: any;
	csmState?: string;
	sourceType?:string;
	isFullOverlay: boolean;
}

export interface OverlaysCriteria  {
	to: string;
	from: string;
	polygon:GeometryObject;
	caseId?:string;
};

export interface OverlaySpecialObject {
	id: string;
	date: Date;
	shape: string; //this will be type soon or I will add another property for shapeType
}
