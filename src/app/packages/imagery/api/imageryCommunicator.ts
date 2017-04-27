import { EventEmitter } from '@angular/core';

/**
 * Created by AsafMasa on 27/04/2017.
 */
export class ImageryCommunicator {
	public setBoundingView(boundingRectangle: GeoJSON.MultiPolygon) {
		this.mapBoundingRectangleChanged.emit(boundingRectangle);
	}
	public mapBoundingRectangleChanged = new EventEmitter();

	public setCenter(center: GeoJSON.Point) {
		this.mapCenterChanged.emit(center);
	}
	public mapCenterChanged = new EventEmitter();
}
