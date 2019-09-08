import {
	BaseImageryPlugin,
	getPolygonIntersectionRatioWithMultiPolygon,
	ImageryMapPosition,
	ImageryPlugin
} from '@ansyn/imagery';
import { OpenLayersDisabledMap, OpenLayersMap } from '@ansyn/ol';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { MapFacadeService, selectMapsList } from '@ansyn/map-facade';
import { debounceTime, filter, map, tap, withLatestFrom } from 'rxjs/operators';
import { AutoSubscription } from 'auto-subscriptions';
import { AlertMsgTypes } from '../../../alerts/model';
import { AddAlertMsg, RemoveAlertMsg } from '../../../overlays/overlay-status/actions/overlay-status.actions';
import { selectDrops, selectFilteredOveralys, selectOverlaysMap } from '../../../overlays/reducers/overlays.reducer';
import { isFullOverlay } from '../../../core/utils/overlays';
import { ICaseMapState } from '../../../menu-items/cases/models/case.model';
import { IOverlay, IOverlayDrop } from '../../../overlays/models/overlay.model';
import { CesiumMap } from '@ansyn/imagery-cesium';

@ImageryPlugin({
	supported: [OpenLayersMap, OpenLayersDisabledMap, CesiumMap],
	deps: [Store]
})
export class AlertsPlugin extends BaseImageryPlugin {
	// todo: combine 2 subscriptions to one
	overlay: IOverlay;
	@AutoSubscription
	setOverlaysNotInCase$: Observable<any> = combineLatest(this.store$.select(selectOverlaysMap), this.store$.select(selectFilteredOveralys) ).pipe(
		map(this.setOverlaysNotInCase.bind(this)),
		tap((action: RemoveAlertMsg | AddAlertMsg) => this.store$.dispatch(action))
	);

	// todo: register store map extent instead of map positionChanged
	@AutoSubscription
	positionChanged$ = () => this.communicator.positionChanged.pipe(
		filter(Boolean),
		debounceTime(500),
		map(this.positionChanged.bind(this)),
		tap((action: RemoveAlertMsg | AddAlertMsg) => this.store$.dispatch(action))
	);

	constructor(protected store$: Store<any>) {
		super();
	}

	setOverlaysNotInCase([drops, currentMap]: [IOverlayDrop[], ICaseMapState]): RemoveAlertMsg | AddAlertMsg {
		const { data, id } = currentMap;
		const { overlay } = data;
		const shouldRemoved = !overlay || drops.some((overlayDrop: IOverlayDrop) => overlayDrop.id === overlay.id);
		const payload = { key: AlertMsgTypes.overlayIsNotPartOfQuery, value: id };
		return shouldRemoved ? new RemoveAlertMsg(payload) : new AddAlertMsg(payload);
	}

	positionChanged([position, currentMap]: [ImageryMapPosition, ICaseMapState]): RemoveAlertMsg | AddAlertMsg {
		const isWorldView = !isFullOverlay(currentMap.data.overlay);
		let isInBound;
		if (!isWorldView) {
			const viewExtent = position.extentPolygon;
			const intersection = getPolygonIntersectionRatioWithMultiPolygon(viewExtent, currentMap.data.overlay.footprint);
			isInBound = Boolean(intersection);
		}
		const payload = { key: AlertMsgTypes.OverlaysOutOfBounds, value: currentMap.id };
		return isWorldView || isInBound ? new RemoveAlertMsg(payload) : new AddAlertMsg(payload);
	}

	onResetView() {
		this.store$.dispatch(new RemoveAlertMsg({ key: AlertMsgTypes.OverlaysOutOfBounds, value: this.mapId }));
		this.store$.dispatch(new RemoveAlertMsg({ key: AlertMsgTypes.overlayIsNotPartOfQuery, value: this.mapId }));
		return super.onResetView();
	}
}
