import {EventEmitter} from '@angular/core';
/**
 * Created by AsafMasa on 25/04/2017.
 */

export interface IProvidedMap {
	centerChanged: EventEmitter<GeoJSON.Point>;
	mapType: string;

	mapObject: any;
	getCenter(): GeoJSON.Point;
	setCenter(center: GeoJSON.Point);
	setBoundingRectangle(rect: GeoJSON.MultiPolygon);
}


