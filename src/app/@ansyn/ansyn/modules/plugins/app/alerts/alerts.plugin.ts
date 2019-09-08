import {
	BaseImageryPlugin,
	getPolygonIntersectionRatioWithMultiPolygon,
	ImageryMapPosition,
	ImageryPlugin,
	IMapSettings
} from '@ansyn/imagery';
import { OpenLayersDisabledMap, OpenLayersMap } from '@ansyn/ol';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { selectMapStateById } from '@ansyn/map-facade';
import { map, tap } from 'rxjs/operators';
import { AutoSubscription } from 'auto-subscriptions';
import { AlertMsgTypes } from '../../../alerts/model';
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
	positionChange$: () => Observable<RemoveAlertMsg | AddAlertMsg | IMapSettings> = () => this.store$.select(selectMapStateById(this.mapId))
		.pipe(
			map((mapState) => this.positionChanged(mapState.data.position, mapState.data.overlay)),
			tap((action) => this.store$.dispatch(<any>action))
		);

	setOverlaysNotInCase([overlays, filteredOverlays]: [Map<string, IOverlay>, string[]]): RemoveAlertMsg | AddAlertMsg {
		const shouldRemoved = !this.overlay || filteredOverlays.some((id: string) => id === this.overlay.id);
		const payload = { key: AlertMsgTypes.overlayIsNotPartOfQuery, value: this.mapId };
		return shouldRemoved ? new RemoveAlertMsg(payload) : new AddAlertMsg(payload);
	}

	positionChanged(position: ImageryMapPosition, overlay: IOverlay): RemoveAlertMsg | AddAlertMsg {
		const isWorldView = !isFullOverlay(overlay);
		let isInBound;
		if (!isWorldView) {
			const viewExtent = position.extentPolygon;
			const intersection = getPolygonIntersectionRatioWithMultiPolygon(viewExtent, overlay.footprint);
			isInBound = Boolean(intersection);
		}
		const payload = { key: AlertMsgTypes.OverlaysOutOfBounds, value: this.mapId };
		return isWorldView || isInBound ? new RemoveAlertMsg(payload) : new AddAlertMsg(payload);
	}

	onResetView() {
		this.store$.dispatch(new RemoveAlertMsg({ key: AlertMsgTypes.OverlaysOutOfBounds, value: this.mapId }));
		this.store$.dispatch(new RemoveAlertMsg({ key: AlertMsgTypes.overlayIsNotPartOfQuery, value: this.mapId }));
		return super.onResetView();
	}
}
