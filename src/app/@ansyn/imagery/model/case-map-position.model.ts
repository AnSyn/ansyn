import { Polygon } from 'geojson';

export type ImageryMapExtent = [number, number, number, number];

export interface ImageryMapProjectedState {
	projection: {
		code: string;
	};
	center?: [number, number];
	resolution?: number;
	rotation?: number
	zoom?: number;
}

export type ImageryMapExtentPolygon = Polygon;

export interface ImageryMapPosition {
	projectedState?: ImageryMapProjectedState;
	extentPolygon?: ImageryMapExtentPolygon;
}

