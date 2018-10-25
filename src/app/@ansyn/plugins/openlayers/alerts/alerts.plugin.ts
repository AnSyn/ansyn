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
	setOverlaysNotInCase$: Observable<any> = this.store$
		.pipe(
			select(selectDrops),
			withLatestFrom(this.currentMap$),
			map(this.setOverlaysNotInCase.bind(this)),
			tap((action: RemoveAlertMsg | AddAlertMsg) => this.store$.dispatch(action))
		);

	@AutoSubscription
	positionChanged$ = () => this.communicator.positionChanged.pipe(
		withLatestFrom(this.currentMap$),
		map(this.positionChanged.bind(this)),
		tap((action: RemoveAlertMsg | AddAlertMsg) => this.store$.dispatch(action))
	);

	constructor(protected store$: Store<any>, protected actions$: Actions) {
		super();
	}

	onDispose() {
		return new RemoveAlertMsg({ key: AlertMsgTypes.OverlaysOutOfBounds, value: this.mapId });
	}

	setOverlaysNotInCase([drops, map]: [IOverlayDrop[], ICaseMapState]): RemoveAlertMsg | AddAlertMsg {
		const { data, id } = map;
		const { overlay } = data;
		const shouldRemoved = !overlay || drops.some((overlayDrop: IOverlayDrop) => overlayDrop.id === overlay.id);
		const payload = { key: AlertMsgTypes.overlayIsNotPartOfQuery, value: id };
		return shouldRemoved ? new RemoveAlertMsg(payload) : new AddAlertMsg(payload);
	}

	positionChanged([position, map]: [any, ICaseMapState]): RemoveAlertMsg | AddAlertMsg {
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
		const payload = { key: AlertMsgTypes.OverlaysOutOfBounds, value: map.id };
		return isWorldView || isInBound ? new RemoveAlertMsg(payload) : new AddAlertMsg(payload);
	}
}
