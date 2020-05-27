import { Point, Polygon } from 'geojson';

export type ImageryMapExtent = [number, number, number, number];

export interface IImageryMapProjectedState {
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

export interface IMouseClick {
	worldLocation: Point;
	screenPixel: [number, number];
	originalEvent: MouseEvent;
}

export type ImageryMapExtentPolygon = Polygon;

export interface IImageryMapPosition {
	projectedState?: IImageryMapProjectedState;
	extentPolygon?: ImageryMapExtentPolygon;
	customResolution?: number;
}

