import MousePosition from 'ol/control/MousePosition';
import { Point } from 'geojson';
import { Observable, Subscription } from 'rxjs';
import * as turf from '@turf/turf';
import Projection from 'ol/proj/Projection';
import { areCoordinatesNumeric } from '@ansyn/core';

export class OpenLayersMousePositionControl extends MousePosition {
	private approximateProjectionSubscription: Subscription;
	private renderedHTML_: string;
	private mapProjection_: Projection;
	private element: HTMLElement;
	private undefinedHTML_: string;

	constructor(opt_options, private projectionFunc: (Point) => Observable<Point>) {
		super(opt_options);
	}

	private positionToPoint(coordinates: [number, number], cb: (p: Point) => void) {
		if (this.approximateProjectionSubscription) {
			this.approximateProjectionSubscription.unsubscribe();
		}

		const point = <Point> turf.geometry('Point', coordinates);
		this.approximateProjectionSubscription = this.projectionFunc(point).subscribe(cb);
	}

	private updateHtmlIfNeeded(html) {
		if (!this.renderedHTML_ || html !== this.renderedHTML_) {
			this.element.innerHTML = html;
			this.renderedHTML_ = html;
		}
	}

	updateHTML_(pixel) {
		let html = this.undefinedHTML_;
		if (pixel && this.mapProjection_) {
			const map = (<any>this).getMap();
			const coordinate = map.getCoordinateFromPixel(pixel);
			if (areCoordinatesNumeric(coordinate)) {
				this.positionToPoint(coordinate, (projectedPoint) => {
					const coordinateFormat = (<any>this).getCoordinateFormat();
					if (coordinateFormat) {
						html = coordinateFormat(<[number, number]> projectedPoint.coordinates);
					} else {
						html = projectedPoint.coordinates.toString();
					}

					this.updateHtmlIfNeeded(html);
				});
			}
		} else {
			this.updateHtmlIfNeeded(html);
		}
	}
}
