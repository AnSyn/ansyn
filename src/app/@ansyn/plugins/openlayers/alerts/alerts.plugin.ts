import { BaseImageryPlugin, ImageryPlugin } from '@ansyn/imagery';
import { OpenLayersMap } from '../open-layers-map/openlayers-map/openlayers-map';
import { select, Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { MapActionTypes, MapFacadeService, PositionChangedAction, selectMapsList } from '@ansyn/map-facade';
import { AddAlertMsg, AlertMsgTypes, ICaseMapState, IOverlayDrop, isFullOverlay, RemoveAlertMsg } from '@ansyn/core';
import { filter, map, tap, withLatestFrom } from 'rxjs/operators';
import { AutoSubscription } from 'auto-subscriptions';
import { bboxPolygon, intersect } from '@turf/turf';
import { selectDrops } from '@ansyn/overlays';

@ImageryPlugin({
	supported: [OpenLayersMap],
	deps: [Store, Actions]
})
export class AlertsPlugin extends BaseImageryPlugin {
	currentMap$: Observable<any> = this.store$.pipe(
		select(selectMapsList),
		map((mapsList: ICaseMapState[]) => MapFacadeService.mapById(mapsList, this.mapId)),
		filter(Boolean)
	);

	@AutoSubscription
	positionChanged$ = () => this.communicator.positionChanged.pipe(
		withLatestFrom(this.currentMap$),
		map(([position, map]: [any, ICaseMapState]) => {
			const key = AlertMsgTypes.OverlaysOutOfBounds;
			const isWorldView = !isFullOverlay(map.data.overlay);
			let isInBound;
			if (!isWorldView) {
				const layerExtent = this.iMap.getMainLayer().getExtent();
				const viewExtent = this.iMap.mapObject.getView().calculateExtent();
				try {
					isInBound = Boolean(intersect(bboxPolygon(layerExtent), bboxPolygon(viewExtent)));
				} catch (e) {
					console.warn('checkImageOutOfBounds$: turf exception', e);
				}
			}

			if (isWorldView || isInBound) {
				return new RemoveAlertMsg({ key, value: map.id });
			}

			return new AddAlertMsg({ key, value: map.id });

		}),
		tap((action) => this.store$.dispatch(action))
	);

	@AutoSubscription
	setOverlaysNotInCase$: Observable<any> = this.store$
		.pipe(
			select(selectDrops),
			withLatestFrom(this.currentMap$),
			map(([drops, map]: [IOverlayDrop[], ICaseMapState]) => {
				const key = AlertMsgTypes.overlayIsNotPartOfQuery;
				const { data, id } = map;
				const { overlay } = data;
				const shouldRemoved = !overlay || drops.some((overlayDrop: IOverlayDrop) => overlayDrop.id === overlay.id);
				return shouldRemoved ? new RemoveAlertMsg({ key, value: id }) : new AddAlertMsg({ key, value: id });
			}),
			tap((action) => this.store$.dispatch(action))
		);


	constructor(protected store$: Store<any>, protected actions$: Actions) {
		super();
	}

	onDispose() {
		return new RemoveAlertMsg({ key: AlertMsgTypes.OverlaysOutOfBounds, value: this.mapId });
	}
}
