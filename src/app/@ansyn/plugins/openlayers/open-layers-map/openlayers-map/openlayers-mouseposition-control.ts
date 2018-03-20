import MousePosition from 'ol/control/mouseposition';
import { Point } from 'geojson';
import { Observable } from 'rxjs/Observable';
import * as turf from '@turf/turf';
import { Subscription } from 'rxjs/Subscription';
import Projection from 'ol/proj/projection';

export class OpenLayersMousePositionControl extends MousePosition {
	private approximateProjectionSubscription: Subscription;
	private renderedHTML_: string;
	private mapProjection_: Projection;
	private element: HTMLElement;
	private undefinedHTML_: string;

	constructor(opt_options, private projectionFunc: (Point) => Observable<Point>) {
		super(opt_options);
	}

	private positionToPoint(coordinates: ol.Coordinate, cb: (p: Point) => void) {
		if (this.approximateProjectionSubscription) {
			this.approximateProjectionSubscription.unsubscribe();
		}

		const point = <GeoJSON.Point> turf.geometry('Point', coordinates);
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
			const map = this.getMap();
			const coordinate = map.getCoordinateFromPixel(pixel);
			if (coordinate) {
				this.positionToPoint(coordinate, (projectedPoint) => {
					const coordinateFormat = this.getCoordinateFormat();
					if (coordinateFormat) {
						html = coordinateFormat(<ol.Coordinate> projectedPoint.coordinates);
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
