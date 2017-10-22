export class MapPosition {
	public zoom: number;
	public rotation?: number;
	public center: GeoJSON.Point;
	public boundingBox?: GeoJSON.Point[];

	static create(zoom: number, center: GeoJSON.Point, rotation?: number, boundingBox?: GeoJSON.Point[]): MapPosition {
		return new MapPosition(zoom, center, rotation, boundingBox);
	}

	constructor(zoom: number,
				center: GeoJSON.Point,
				rotation?: number,
				boundingBox?: GeoJSON.Point[]) {
		this.zoom = zoom;
		this.center = center;
		this.rotation = rotation;
		this.boundingBox = boundingBox;
	}
}
