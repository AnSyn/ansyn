/**
 * Created by AsafMas on 06/06/2017.
 */

export class Extent {
	public topLeft: GeoJSON.Position;
	public topRight: GeoJSON.Position;
	public bottomLeft: GeoJSON.Position;
	public bottomRight: GeoJSON.Position;

	static create(topLeft: GeoJSON.Position,
				  topRight: GeoJSON.Position,
				  bottomLeft: GeoJSON.Position,
				  bottomRight: GeoJSON.Position): Extent {

		const extent = new Extent();
		extent.topLeft = topLeft;
		extent.topRight = topRight;
		extent.bottomLeft = bottomLeft;
		extent.bottomRight = bottomRight;
		return extent;
	}
}
