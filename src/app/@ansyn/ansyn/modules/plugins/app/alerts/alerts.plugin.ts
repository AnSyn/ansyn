import {
	BaseImageryPlugin,
	getPolygonIntersectionRatio,
	ImageryMapPosition,
	ImageryPlugin
} from '@ansyn/imagery';
import { OpenLayersDisabledMap, OpenLayersMap } from '@ansyn/ol';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { selectMapPositionByMapId, selectOverlayByMapId } from '@ansyn/map-facade';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { AutoSubscription } from 'auto-subscriptions';
import { AlertMsgTypesEnum } from '../../../alerts/model';
import { AddAlertMsg, RemoveAlertMsg } from '../../../overlays/overlay-status/actions/overlay-status.actions';
import { selectFilteredOveralys, selectOverlaysMap } from '../../../overlays/reducers/overlays.reducer';
import { isFullOverlay } from '../../../core/utils/overlays';
import { IOverlay } from '../../../overlays/models/overlay.model';
import { CesiumMap } from '@ansyn/imagery-cesium';

@ImageryPlugin({
	supported: [OpenLayersMap, OpenLayersDisabledMap, CesiumMap],
	deps: [Store]
})
export class AlertsPlugin extends BaseImageryPlugin {
	overlay: IOverlay;
	@AutoSubscription
	setOverlaysNotInCase$: Observable<any> = combineLatest(this.store$.select(selectOverlaysMap), this.store$.select(selectFilteredOveralys)).pipe(
		map(this.setOverlaysNotInCase.bind(this)),
		tap((action: RemoveAlertMsg | AddAlertMsg) => this.store$.dispatch(action))
	);

	constructor(protected store$: Store<any>) {
		super();
	}

	@AutoSubscription
	positionChange$ = () => combineLatest(this.store$.select(selectMapPositionByMapId(this.mapId)), this.store$.select(selectOverlayByMapId(this.mapId)))
		.pipe(
			tap(([position, overlay]) => this.overlay = overlay),
			filter(([position, overlay]) => Boolean(position) && Boolean(overlay)),
			switchMap(([position, overlay]) => {
				const actions = [this.positionChanged(position, overlay)];
				return actions.map(action => this.store$.dispatch(action))
			}),
		);

	setOverlaysNotInCase([overlays, filteredOverlays]: [Map<string, IOverlay>, string[]]): RemoveAlertMsg | AddAlertMsg {
		const shouldRemoved = !this.overlay || filteredOverlays.some((id: string) => id === this.overlay.id);
		const payload = { key: AlertMsgTypesEnum.overlayIsNotPartOfQuery, value: this.mapId };
		return shouldRemoved ? new RemoveAlertMsg(payload) : new AddAlertMsg(payload);
	}

	positionChanged(position: ImageryMapPosition, overlay: IOverlay): RemoveAlertMsg | AddAlertMsg {
		const isWorldView = !isFullOverlay(overlay);
		let isInBound;
		if (!isWorldView) {
			const viewExtent = position.extentPolygon;
			const intersection = getPolygonIntersectionRatio(viewExtent, overlay.footprint);
			isInBound = Boolean(intersection);
		}
		const payload = { key: AlertMsgTypesEnum.OverlaysOutOfBounds, value: this.mapId };
		return isWorldView || isInBound ? RemoveAlertMsg(payload) : AddAlertMsg(payload);
	}

	onResetView() {
		this.store$.dispatch(RemoveAlertMsg({ key: AlertMsgTypesEnum.OverlaysOutOfBounds, value: this.mapId }));
		this.store$.dispatch(RemoveAlertMsg({ key: AlertMsgTypesEnum.overlayIsNotPartOfQuery, value: this.mapId }));
		return super.onResetView();
	}
}
