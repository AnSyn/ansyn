import {
	BaseImageryPlugin,
	geojsonMultiPolygonToPolygon,
	ImageryMapPosition,
	ImageryPlugin
} from '@ansyn/imagery';
import { OpenLayersMap, OpenLayersDisabledMap } from '@ansyn/ol';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { MapFacadeService, selectMapsList } from '@ansyn/map-facade';
import { debounceTime, filter, map, tap, withLatestFrom } from 'rxjs/operators';
import { AutoSubscription } from 'auto-subscriptions';
import { bboxPolygon, intersect } from '@turf/turf';
import { AlertMsgTypes } from '../../../alerts/model';
import { AddAlertMsg, RemoveAlertMsg } from '../../../overlays/overlay-status/actions/overlay-status.actions';
import { selectDrops } from '../../../overlays/reducers/overlays.reducer';
import { isFullOverlay } from '../../../core/utils/overlays';
import { ICaseMapState } from '../../../menu-items/cases/models/case.model';
import { IOverlayDrop } from '../../../overlays/models/overlay.model';
import { CesiumMap } from '@ansyn/imagery-cesium';

@ImageryPlugin({
	supported: [OpenLayersMap, OpenLayersDisabledMap, CesiumMap],
	deps: [Store]
})
export class AlertsPlugin extends BaseImageryPlugin {
	currentMap$: Observable<ICaseMapState> = this.store$.pipe(
		select(selectMapsList),
		map((mapsList: ICaseMapState[]) => MapFacadeService.mapById(mapsList, this.mapId)),
		filter(Boolean)
	);

	@AutoSubscription
	setOverlaysNotInCase$: Observable<any> = combineLatest(this.store$.select(selectDrops), this.currentMap$).pipe(
		map(this.setOverlaysNotInCase.bind(this)),
		tap((action: RemoveAlertMsg | AddAlertMsg) => this.store$.dispatch(action))
	);

	@AutoSubscription
	positionChanged$ = () => this.communicator.positionChanged.pipe(
		debounceTime(500),
		withLatestFrom(this.currentMap$),
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
			const layerExtent = geojsonMultiPolygonToPolygon(currentMap.data.overlay.footprint);

			try {
				isInBound = Boolean(intersect(layerExtent, viewExtent));
			} catch (e) {
				console.warn('checkImageOutOfBounds$: turf exception', e);
			}
		}
		const payload = { key: AlertMsgTypes.OverlaysOutOfBounds, value: currentMap.id };
		return isWorldView || isInBound ? new RemoveAlertMsg(payload) : new AddAlertMsg(payload);
	}

	onResetView() {
		this.store$.dispatch(new RemoveAlertMsg({ key: AlertMsgTypes.OverlaysOutOfBounds, value: this.mapId }))
		this.store$.dispatch(new RemoveAlertMsg({ key: AlertMsgTypes.overlayIsNotPartOfQuery, value: this.mapId }))
		return super.onResetView();
	}
}
