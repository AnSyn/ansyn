import { BaseImageryPlugin, geojsonMultiPolygonToPolygons, ImageryMapPosition, ImageryPlugin } from '@ansyn/imagery';
import { OpenLayersDisabledMap, OpenLayersMap } from '@ansyn/ol';
import { select, Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import { selectOverlayFromMap } from '@ansyn/map-facade';
import { debounceTime, map, tap, distinctUntilChanged } from 'rxjs/operators';
import { AutoSubscription } from 'auto-subscriptions';
import { intersect } from '@turf/turf';
import { AlertMsgTypes } from '../../../alerts/model';
import { AddAlertMsg, RemoveAlertMsg } from '../../../overlays/overlay-status/actions/overlay-status.actions';
import { selectDrops, selectFilteredOveralys, selectOverlaysMap } from '../../../overlays/reducers/overlays.reducer';
import { isFullOverlay } from '../../../core/utils/overlays';
import { IOverlay, IOverlayDrop } from '../../../overlays/models/overlay.model';
import { CesiumMap } from '@ansyn/imagery-cesium';
import { Polygon } from 'geojson';

@ImageryPlugin({
	supported: [OpenLayersMap, OpenLayersDisabledMap, CesiumMap],
	deps: [Store]
})
export class AlertsPlugin extends BaseImageryPlugin {
	overlay: IOverlay;
	@AutoSubscription
	setOverlaysNotInCase$: Observable<any> = combineLatest(this.store$.select(selectOverlaysMap), this.store$.select(selectFilteredOveralys) ).pipe(
		distinctUntilChanged(),
		map(this.setOverlaysNotInCase.bind(this)),
		tap((action: RemoveAlertMsg | AddAlertMsg) => this.store$.dispatch(action))
	);

	constructor(protected store$: Store<any>) {
		super();
	}

	@AutoSubscription
	positionChanged$ = () => this.communicator.positionChanged.pipe(
		debounceTime(500),
		map(this.positionChanged.bind(this)),
		tap((action: RemoveAlertMsg | AddAlertMsg) => this.store$.dispatch(action))
	);

	@AutoSubscription
	overlay$ = () => this.store$.pipe(
		select(selectOverlayFromMap(this.mapId)),
		tap(overlay => this.overlay = overlay)
	);

	setOverlaysNotInCase([overlays, filteredOverlays]: [Map<string, IOverlay>, string[]]): RemoveAlertMsg | AddAlertMsg {
		const shouldRemoved = !this.overlay || filteredOverlays.some((id: string) => id === this.overlay.id);
		const payload = { key: AlertMsgTypes.overlayIsNotPartOfQuery, value: this.mapId };
		return shouldRemoved ? new RemoveAlertMsg(payload) : new AddAlertMsg(payload);
	}

	positionChanged(position: ImageryMapPosition): RemoveAlertMsg | AddAlertMsg {
		const isWorldView = !isFullOverlay(this.overlay);
		let isInBound;
		if (!isWorldView) {
			const viewExtent = position.extentPolygon;
			const layerExtents: Polygon[] = geojsonMultiPolygonToPolygons(this.overlay.footprint);

			try {
				for (let i = 0; i < layerExtents.length; i++) {
					isInBound = Boolean(intersect(layerExtents[i], viewExtent));
					if (isInBound) {
						break;
					}
				}
			} catch (e) {
				// todo: check for multi polygon bug
				console.warn('checkImageOutOfBounds$: turf exception', e);
			}
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
