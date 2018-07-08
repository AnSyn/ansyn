import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Point as GeoPoint } from 'geojson';
import * as turf from '@turf/turf';
import { inside } from '@turf/turf';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { fromEvent, Observable, pipe } from 'rxjs';
import { BaseImageryPlugin } from '@ansyn/imagery/model/base-imagery-plugin';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { IAppState } from '@ansyn/ansyn/app-effects/app.effects.module';
import { ContextMenuDisplayAction, ContextMenuShowAction, MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { overlaysStateSelector } from '@ansyn/overlays/reducers/overlays.reducer';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { areCoordinatesNumeric } from '@ansyn/core/utils/geo';
import { ImageryPlugin } from '@ansyn/imagery/model/decorators/imagery-plugin';
import { DisplayOverlayFromStoreAction } from '@ansyn/overlays/actions/overlays.actions';
import { tap, filter, withLatestFrom, map } from 'rxjs/operators';
import { selectActiveMapId } from '@ansyn/map-facade/reducers/map.reducer';
import { cold, hot } from 'jasmine-marbles';

@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Store, Actions, ProjectionService]
})
export class ContextMenuPlugin extends BaseImageryPlugin {
	isActiveOperators = pipe(
		withLatestFrom(this.store$.select(selectActiveMapId).pipe(map((activeMapId: string) => activeMapId === this.mapId))),
		filter(([prevData, isActive]: [any, boolean]) => isActive),
		map(([prevData]: [any, boolean]) => prevData)
	);

	onContextMenuDisplayAction$: Observable<any> = this.actions$
		.pipe(
			ofType<ContextMenuDisplayAction>(MapActionTypes.CONTEXT_MENU.DISPLAY),
			map(({ payload }) => payload),
			this.isActiveOperators,
			map(id => new DisplayOverlayFromStoreAction({ id })),
			tap((action) => this.store$.dispatch(action))
		);

	contextMenuTrigger$ = () => fromEvent(this.containerElem, 'contextmenu')
		.pipe(
			tap(this.contextMenuEventListener.bind(this))
		);

	get containerElem(): HTMLElement {
		return <HTMLElement> this.iMap.mapObject.getViewport();
	}

	constructor(protected store$: Store<IAppState>, protected actions$: Actions, protected projectionService: ProjectionService) {
		super();
	}

	onInit() {
		this.subscriptions.push(
			this.contextMenuTrigger$().subscribe(),
			this.onContextMenuDisplayAction$.subscribe()
		);
	}

	contextMenuEventListener(event: MouseEvent) {
		event.preventDefault();

		this.containerElem.click();

		let coordinate = this.iMap.mapObject.getCoordinateFromPixel([event.offsetX, event.offsetY]);
		if (!areCoordinatesNumeric(coordinate)) {
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
}
