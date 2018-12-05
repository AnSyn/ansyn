import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Point as GeoPoint } from 'geojson';
import * as turf from '@turf/turf';
import { inside } from '@turf/turf';
import { BaseImageryPlugin, ImageryPlugin, ProjectionService } from '@ansyn/imagery';
import { fromEvent, Observable, pipe, UnaryFunction } from 'rxjs';
import { ContextMenuDisplayAction, ContextMenuShowAction, MapActionTypes, selectActiveMapId } from '@ansyn/map-facade';
import { DisplayOverlayFromStoreAction, overlaysStateSelector } from '@ansyn/overlays';
import { areCoordinatesNumeric, IOverlay } from '@ansyn/core';
import { filter, map, take, tap, withLatestFrom } from 'rxjs/operators';
import { AutoSubscription } from 'auto-subscriptions';
import { OpenLayersMap } from '../open-layers-map/openlayers-map/openlayers-map';

@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Store, Actions, ProjectionService]
})
export class ContextMenuPlugin extends BaseImageryPlugin {
	isActiveOperators: UnaryFunction<any, any> = pipe(
		withLatestFrom(this.store$.select(selectActiveMapId).pipe(map((activeMapId: string) => activeMapId === this.mapId))),
		filter(([prevData, isActive]: [any, boolean]) => isActive),
		map(([prevData]: [any, boolean]) => prevData)
	);

	@AutoSubscription
	onContextMenuDisplayAction$: Observable<any> = this.actions$
		.pipe(
			ofType<ContextMenuDisplayAction>(MapActionTypes.CONTEXT_MENU.DISPLAY),
			map(({ payload }) => payload),
			this.isActiveOperators,
			map((id: string) => new DisplayOverlayFromStoreAction({ id })),
			tap((action) => this.store$.dispatch(action))
		);

	@AutoSubscription
	contextMenuTrigger$ = () => fromEvent(this.containerElem, 'contextmenu')
		.pipe(
			tap(this.contextMenuEventListener.bind(this))
		);

	get containerElem(): HTMLElement {
		return <HTMLElement> this.iMap.mapObject.getViewport();
	}

	constructor(protected store$: Store<any>, protected actions$: Actions, protected projectionService: ProjectionService) {
		super();
	}

	contextMenuEventListener(event: MouseEvent) {
		event.preventDefault();

		this.containerElem.click();

		let coordinate = this.iMap.mapObject.getCoordinateFromPixel([event.offsetX, event.offsetY]);
		if (!areCoordinatesNumeric(coordinate)) {
			console.warn('no coordinate for pixel');
			return;
		}
		this.positionToPoint(coordinate).pipe(
			withLatestFrom(this.store$.select(overlaysStateSelector)),
			tap(([point, overlaysState]) => {
				const overlays = overlaysState.filteredOverlays
					.map((id: string): IOverlay => overlaysState.overlays.get(id))
					.filter(({ footprint }) => inside(point, footprint));

				this.store$.dispatch(new ContextMenuShowAction({ point, event, overlays }));
			}))
			.subscribe();
	}

	positionToPoint(coordinates: [number, number]): Observable<any> {
		const point = <GeoPoint> turf.geometry('Point', coordinates);
		return this.projectionService
			.projectAccurately(point, this.iMap).pipe(take(1));
	}
}
