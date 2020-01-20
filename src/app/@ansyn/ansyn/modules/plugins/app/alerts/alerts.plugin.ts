import {
	BaseImageryPlugin,
	getPolygonIntersectionRatio,
	ImageryMapPosition,
	ImageryPlugin
} from '@ansyn/imagery';
import { OpenLayersDisabledMap, OpenLayersMap } from '@ansyn/ol';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of } from 'rxjs';
import { selectMapPositionByMapId, selectOverlayByMapId } from '@ansyn/map-facade';
import { filter, map, switchMap, tap, startWith  } from 'rxjs/operators';
import { AutoSubscription } from 'auto-subscriptions';
import { AlertMsgTypesEnum } from '../../../alerts/model';
import { AddAlertMsg, RemoveAlertMsg } from '../../../overlays/overlay-status/actions/overlay-status.actions';
import { selectFilteredOveralys } from '../../../overlays/reducers/overlays.reducer';
import { isFullOverlay } from '../../../core/utils/overlays';
import { IOverlay } from '../../../overlays/models/overlay.model';
import { CesiumMap } from '@ansyn/imagery-cesium';
import { selectAlertMsg } from '../../../overlays/overlay-status/reducers/overlay-status.reducer';

@ImageryPlugin({
	supported: [OpenLayersMap, OpenLayersDisabledMap, CesiumMap],
	deps: [Store]
})
export class AlertsPlugin extends BaseImageryPlugin {
	notInQueryMsg: boolean;
	outOfBound: boolean;
	filteredOverlay$ = this.store$.select(selectFilteredOveralys);

	@AutoSubscription
	selectAlertMsg$ = this.store$.select(selectAlertMsg).pipe(
		tap( alertMsg => {
			const queryNotInBound = alertMsg.get(AlertMsgTypesEnum.overlayIsNotPartOfQuery);
			const outOfBound = alertMsg.get(AlertMsgTypesEnum.OverlaysOutOfBounds);
			this.notInQueryMsg = queryNotInBound && queryNotInBound.has(this.mapId);
			this.outOfBound = outOfBound && outOfBound.has(this.mapId);
		})
	);

	overlayByMap$ = (mapId) => this.store$.select(selectOverlayByMapId(mapId));

	@AutoSubscription
	setOverlaysNotInCase$ = () => combineLatest(
		this.overlayByMap$(this.mapId).pipe(startWith(null)),
		this.filteredOverlay$.pipe(startWith([]))).pipe(
		map(this.setOverlaysNotInCase.bind(this)),
		filter(Boolean),
		tap((action: RemoveAlertMsg | AddAlertMsg) => this.store$.dispatch(action))
	);

	constructor(protected store$: Store<any>) {
		super();
	}

	@AutoSubscription
	positionChange$ = () => combineLatest(this.store$.select(selectMapPositionByMapId(this.mapId)), this.store$.select(selectOverlayByMapId(this.mapId)))
		.pipe(
			filter(([position, overlay]) => Boolean(position) && Boolean(overlay)),
			switchMap(this.positionChanged.bind(this)),
			filter(Boolean),
			tap( (action: RemoveAlertMsg | AddAlertMsg) => this.store$.dispatch(action))
		);

	setOverlaysNotInCase([overlay, filteredOverlays]: [IOverlay, string[]]): RemoveAlertMsg | AddAlertMsg {
		const shouldRemoved = !overlay || filteredOverlays.some((id: string) => id === overlay.id);
		const payload = { key: AlertMsgTypesEnum.overlayIsNotPartOfQuery, value: this.mapId };
		return shouldRemoved ?
			(this.notInQueryMsg ?
				new RemoveAlertMsg(payload) : null) : new AddAlertMsg(payload);
	}

	positionChanged([position, overlay]: [ImageryMapPosition, IOverlay]): Observable<RemoveAlertMsg | AddAlertMsg | null> {
		let action;
		const payload = { key: AlertMsgTypesEnum.OverlaysOutOfBounds, value: this.mapId };
		const isWorldView = !isFullOverlay(overlay);
		let isInBound;
		if (isWorldView) {
			action = this.outOfBound ? of(new RemoveAlertMsg(payload)) : of(null);
		}
		else {
			const viewExtent = position.extentPolygon;
			const intersection = getPolygonIntersectionRatio(viewExtent, overlay.footprint);
			isInBound = Boolean(intersection);
			action = !isInBound ? of(new AddAlertMsg(payload)) :
				this.outOfBound ? of(new RemoveAlertMsg(payload)) : of(null);
		}
		return action
	}
}
