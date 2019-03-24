import { Polygon } from 'geojson';

export type CaseMapExtent = [number, number, number, number];

export interface ICaseMapProjectedState {
	projection: {
		code: string;
	};
	center?: [number, number];
	resolution?: number;
	rotation?: number
	zoom?: number;
}

export type CaseMapExtentPolygon = Polygon;

export interface ICaseMapPosition {
	projectedState?: ICaseMapProjectedState;
	extentPolygon?: CaseMapExtentPolygon;
}
