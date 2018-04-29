import { BaseImageryPlugin } from '@ansyn/imagery';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { Point as GeoPoint } from 'geojson';
import * as turf from '@turf/turf';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { ContextMenuShowAction } from '@ansyn/map-facade';
import { IAppState } from '@ansyn/ansyn';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map';
import { Observable } from 'rxjs/Observable';

export class ContextMenuPlugin extends BaseImageryPlugin {
	static supported = [OpenlayersMapName];

	get containerElem(): HTMLElement {
		return <HTMLElement> this.iMap.mapObject.getViewport();
	}

	constructor(protected store$: Store<IAppState>, protected actions$: Actions, protected projectionService: ProjectionService) {
		super();
	}

	onInit() {
		this.containerElem.addEventListener('contextmenu', this.contextMenuEventListener.bind(this));
	}

	contextMenuEventListener(e: MouseEvent) {
		e.preventDefault();

		this.containerElem.click();

		let coordinate = this.iMap.mapObject.getCoordinateFromPixel([e.offsetX, e.offsetY]);
		this.positionToPoint(coordinate)
			.do((point) => {
				this.store$.dispatch(new ContextMenuShowAction({ point, e }));
			})
			.subscribe();
	}

	positionToPoint(coordinates: ol.Coordinate): Observable<any> {
		const point = <GeoPoint> turf.geometry('Point', coordinates);
		return this.projectionService
			.projectAccurately(point, this.iMap)
			.take(1);
	}

	onDispose() {
		if (this.containerElem) {
			this.containerElem.removeEventListener('contextmenu', this.contextMenuEventListener.bind(this));
		}
	}
}
