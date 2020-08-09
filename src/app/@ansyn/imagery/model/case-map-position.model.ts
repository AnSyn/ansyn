import { Polygon, Position } from 'geojson';

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

export interface ICompressedImageryMapProjectedState {
	p: {
		c: any;
	};
	c?: any;
	re?: number;
	ro?: number;
	pi?: number;
	rol?: number;
	z?: number;
	ca?: any;
}

export interface IMousePointerMove {
	lat: number;
	long: number;
	height: number;
}

export type ImageryMapExtentPolygon = Polygon;

export interface ICompressedImageryMapExtentPolygon {
	c?: string;
	t?: Position[][];
}

export interface ImageryMapPosition {
	projectedState?: ImageryMapProjectedState;
	extentPolygon?: ImageryMapExtentPolygon;
	customResolution?: number;
}

export interface ICompressedImageryMapPosition {
	p?: ICompressedImageryMapProjectedState;
	e?: ICompressedImageryMapExtentPolygon;
	c?: number;
}

