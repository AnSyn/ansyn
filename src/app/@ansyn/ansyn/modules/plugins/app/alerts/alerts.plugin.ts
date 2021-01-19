import {
	BaseImageryPlugin, bboxFromGeoJson,
	getPolygonIntersectionRatio,
	IImageryMapPosition,
	ImageryPlugin
} from '@ansyn/imagery';
import { OpenLayersDisabledMap, OpenLayersMap } from '@ansyn/ol';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of } from 'rxjs';
import { selectMapPositionByMapId, selectOverlayByMapId } from '@ansyn/map-facade';
import { filter, map, switchMap, tap, startWith  } from 'rxjs/operators';
import { AutoSubscription } from 'auto-subscriptions';
import { AlertMsgTypesEnum } from '../../../alerts/model';
import {
	AddAlertMsg,
	BackToExtentAction,
	RemoveAlertMsg
} from '../../../overlays/overlay-status/actions/overlay-status.actions';
import { selectFilteredOveralys } from '../../../overlays/reducers/overlays.reducer';
import { isFullOverlay } from '../../../core/utils/overlays';
import { IOverlay } from '../../../overlays/models/overlay.model';
import { CesiumMap } from '@ansyn/imagery-cesium';
import { selectAlertMsg } from '../../../overlays/overlay-status/reducers/overlay-status.reducer';
import { Injectable } from '@angular/core';

@ImageryPlugin({
	supported: [OpenLayersMap, OpenLayersDisabledMap, CesiumMap],
	deps: [Store]
})
@Injectable()
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

	constructor(protected store$: Store<any>) {
		super();
	}

	overlayByMap$ = (mapId) => this.store$.select(selectOverlayByMapId(mapId));

	@AutoSubscription
	setOverlaysNotInCase$ = () => combineLatest([
		this.overlayByMap$(this.mapId).pipe(startWith<any, null>(null)),
		this.filteredOverlay$.pipe(startWith([]))]).pipe(
		map(this.setOverlaysNotInCase.bind(this)),
		filter(Boolean),
		tap((action: RemoveAlertMsg | AddAlertMsg) => this.store$.dispatch(action))
	);

	@AutoSubscription
	positionChange$ = () => combineLatest([this.store$.select(selectMapPositionByMapId(this.mapId)), this.store$.select(selectOverlayByMapId(this.mapId))])
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

	positionChanged([position, overlay]: [IImageryMapPosition, IOverlay]): Observable<RemoveAlertMsg | AddAlertMsg | null> {
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

			// calling the BackToExtentAction here because the alert is currently disabled.
			action = isInBound ? of(null) : of(new BackToExtentAction({
				mapId: this.mapId,
				extent: bboxFromGeoJson(overlay.footprint)
			}))
		}

		return action;
	}
}
