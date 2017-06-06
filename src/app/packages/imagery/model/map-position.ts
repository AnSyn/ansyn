/**
 * Created by AsafMas on 06/06/2017.
 */

export class MapPosition {
	public zoom: number;
	public rotation?: number;
	public center: GeoJSON.Point;

	static create(zoom: number,
				  center: GeoJSON.Point,
				  rotation?: number): MapPosition {

		const mapPosition = new MapPosition(zoom, center, rotation);
		return mapPosition;
	}

	constructor(zoom: number,
				center: GeoJSON.Point,
				rotation?: number) {
		this.zoom = zoom;
		this.center = center;
		this.rotation = rotation;
	}
}
