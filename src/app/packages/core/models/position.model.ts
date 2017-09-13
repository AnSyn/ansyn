export interface Position {
	zoom: number;
	rotation?: number;
	center: GeoJSON.Point;
	boundingBox?: GeoJSON.Point[];
}
