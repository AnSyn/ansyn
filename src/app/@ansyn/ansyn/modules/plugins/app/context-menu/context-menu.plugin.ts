import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Point as GeoPoint } from 'geojson';
import * as turf from '@turf/turf';
import { areCoordinatesNumeric, BaseImageryPlugin, ImageryPlugin, isPointContainedInGeometry } from '@ansyn/imagery';
import { fromEvent, Observable, pipe, UnaryFunction } from 'rxjs';
import { ContextMenuDisplayAction, ContextMenuShowAction, MapActionTypes, selectActiveMapId } from '@ansyn/map-facade';
import { filter, map, take, tap, withLatestFrom } from 'rxjs/operators';
import { AutoSubscription } from 'auto-subscriptions';
import { overlaysStateSelector } from '../../../overlays/reducers/overlays.reducer';
import { DisplayOverlayFromStoreAction } from '../../../overlays/actions/overlays.actions';
import { IOverlay } from '../../../overlays/models/overlay.model';
import { OpenLayersMap, OpenlayersMapName, OpenLayersProjectionService } from '@ansyn/ol';
import { CesiumMap, CesiumMapName, CesiumProjectionService } from '@ansyn/imagery-cesium';
import { Injectable } from '@angular/core';

@ImageryPlugin({
	supported: [OpenLayersMap, CesiumMap],
	deps: [Store, Actions, OpenLayersProjectionService, CesiumProjectionService]
})
@Injectable()
export class ContextMenuPlugin extends BaseImageryPlugin {

	get containerElem(): HTMLElement {
		return this.iMap.getHtmlContainer();
	}
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

	constructor(protected store$: Store<any>, protected actions$: Actions, protected olProjectionService: OpenLayersProjectionService, protected cesiumProjectionService: CesiumProjectionService) {
		super();
	}

	@AutoSubscription
	contextMenuTrigger$ = () => fromEvent(this.containerElem, 'contextmenu')
		.pipe(
			tap(this.contextMenuEventListener.bind(this))
		);

	contextMenuEventListener(event) {
		event.preventDefault();

		this.containerElem.click();

		let coordinate = this.iMap.getCoordinateFromScreenPixel({ x: event.layerX, y: event.layerY });
		if (!areCoordinatesNumeric(coordinate)) {
			console.warn('no coordinate for pixel');
			return;
		}
		this.positionToPoint(coordinate).pipe(
			withLatestFrom(this.store$.select(overlaysStateSelector)),
			tap(([point, overlaysState]) => {
				const overlays = overlaysState.filteredOverlays
					.map((id: string): IOverlay => overlaysState.entities[id])
					.filter(({ footprint }) => isPointContainedInGeometry(point, footprint));

				this.store$.dispatch(new ContextMenuShowAction({ point, event, overlays }));
			}))
			.subscribe();
	}

	positionToPoint(coordinates: [number, number, number]): Observable<any> {
		const point = <GeoPoint>turf.geometry('Point', coordinates);
		if (this.iMap.mapType === OpenlayersMapName) {
			return this.olProjectionService
				.projectAccurately(point, this.iMap.mapObject).pipe(take(1));
		} else if (this.iMap.mapType === CesiumMapName) {
			return this.cesiumProjectionService
				.projectAccurately(point, this.iMap.mapObject).pipe(take(1));
		} else {
			console.error('not implemented');
		}
	}
}
