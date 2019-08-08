import { Polygon } from 'geojson';

export type ImageryMapExtent = [number, number, number, number];

export interface ImageryMapProjectedState {
	projection: {
		code: string;
	};
	center?: [number, number, number];
	resolution?: number;
	rotation?: number;
	pitch?: number;
	roll?: number;
	zoom?: number;
	cameraPosition?: any;
}

export interface IMousePointerMove {
	lat: number;
	long: number;
	height: number;
}

export type ImageryMapExtentPolygon = Polygon;

export interface ImageryMapPosition {
	projectedState?: ImageryMapProjectedState;
	extentPolygon?: ImageryMapExtentPolygon;
	customResolution?: number;
}

