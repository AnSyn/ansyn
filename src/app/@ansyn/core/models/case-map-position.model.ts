export type CaseMapExtent = [number, number, number, number];

export interface CaseMapProjectedState {
	projection: {
		code: string;
	};
	center?: [number, number];
	resolution?: number;
	rotation?: number
	zoom?: number;
}

export type CaseMapExtentPolygon = GeoJSON.Polygon;

export interface CaseMapPosition {
	projectedState: CaseMapProjectedState;
	extentPolygon: CaseMapExtentPolygon;
}
