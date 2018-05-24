import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { Point as GeoPoint } from 'geojson';
import * as turf from '@turf/turf';
import { inside } from '@turf/turf';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { Observable } from 'rxjs/Observable';
import { BaseImageryPlugin, ImageryPlugin } from '@ansyn/imagery/model/base-imagery-plugin';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { IAppState } from '@ansyn/ansyn/app-effects/app.effects.module';
import { ContextMenuShowAction } from '@ansyn/map-facade/actions/map.actions';
import { overlaysStateSelector } from '@ansyn/overlays/reducers/overlays.reducer';
import { Overlay } from '@ansyn/core/models/overlay.model';

@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Store, Actions, ProjectionService]
})
export class ContextMenuPlugin extends BaseImageryPlugin {
	get containerElem(): HTMLElement {
		return <HTMLElement> this.iMap.mapObject.getViewport();
	}

	constructor(protected store$: Store<IAppState>, protected actions$: Actions, protected projectionService: ProjectionService) {
		super();
	}

	onInit() {
		this.containerElem.addEventListener('contextmenu', this.contextMenuEventListener.bind(this));
	}

	contextMenuEventListener(event: MouseEvent) {
		event.preventDefault();

		this.containerElem.click();

		let coordinate = this.iMap.mapObject.getCoordinateFromPixel([event.offsetX, event.offsetY]);
		if (!coordinate || isNaN(coordinate[0] || isNaN(coordinate[1]))) {
			console.warn('no coordinate for pixel');
			return;
		}
		this.positionToPoint(coordinate)
			.withLatestFrom(this.store$.select(overlaysStateSelector))
			.do(([point, overlaysState]) => {
				const overlays = overlaysState.filteredOverlays
					.map((id: string): Overlay => overlaysState.overlays.get(id))
					.filter(({ footprint }) => inside(point, footprint));

				this.store$.dispatch(new ContextMenuShowAction({ point, event, overlays }));
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
