import { Observable, of } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { BaseImageryPlugin, CommunicatorEntity, ImageryPlugin, MapOrientation } from '@ansyn/imagery';
import {
	MapActionTypes,
	PointToRealNorthAction,
	selectActiveMapId
} from '@ansyn/map-facade';
import { AutoSubscription } from 'auto-subscriptions';
import { filter, map, tap, withLatestFrom } from 'rxjs/operators';
import { LoggerService } from '../../../../core/services/logger.service';
import {
	ChangeOverlayPreviewRotationAction,
	DisplayOverlaySuccessAction,
	OverlaysActionTypes
} from '../../../../overlays/actions/overlays.actions';
import { selectHoveredOverlay } from '../../../../overlays/reducers/overlays.reducer';
import { IOverlay } from '../../../../overlays/models/overlay.model';
import {
	BackToWorldSuccess,
	BackToWorldView,
	OverlayStatusActionsTypes
} from '../../../../overlays/overlay-status/actions/overlay-status.actions';
import { CesiumMap, CesiumProjectionService } from '@ansyn/imagery-cesium';
import { selectMapOrientation } from '@ansyn/map-facade';

@ImageryPlugin({
	supported: [CesiumMap],
	deps: [Actions, LoggerService, Store, CesiumProjectionService]
})
export class NorthCalculationsPlugin extends BaseImageryPlugin {
	communicator: CommunicatorEntity;
	isEnabled = true;

	@AutoSubscription
	hoveredOverlayPreview$: Observable<any> = this.store$.select(selectHoveredOverlay).pipe(
		withLatestFrom(this.store$.pipe(select(selectActiveMapId))),
		filter(([overlay, activeMapId]: [IOverlay, string]) => Boolean(overlay) && Boolean(this.communicator) && activeMapId === this.mapId),
		map(([overlay, activeMapId]: [IOverlay, string]) => {
			// @todo: use real projection
			const currentRotation = this.communicator.getRotation();
			this.store$.dispatch(new ChangeOverlayPreviewRotationAction(currentRotation));
		})
	);

	@AutoSubscription
	pointToRealNorth$ = this.actions$.pipe(
		ofType<PointToRealNorthAction>(MapActionTypes.POINT_TO_REAL_NORTH),
		filter((action: PointToRealNorthAction) => action.payload === this.mapId),
		tap((action: PointToRealNorthAction) => {
			// @todo: use image data
			return this.communicator.ActiveMap.setRotation(0);
		})
	);

	@AutoSubscription
	calcNorthAfterDisplayOverlaySuccess$ = () => this.actions$.pipe(
		ofType<DisplayOverlaySuccessAction>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS),
		filter((action: DisplayOverlaySuccessAction) => action.payload.mapId === this.mapId),
		withLatestFrom(this.store$.select(selectMapOrientation(this.mapId)), ({ payload }: DisplayOverlaySuccessAction, orientation) => {
			return [payload.forceFirstDisplay, orientation, payload.overlay];
		}),
		tap(([forceFirstDisplay, orientation, overlay]: [boolean, MapOrientation, IOverlay]) => {
			if (!forceFirstDisplay && orientation === 'Imagery Perspective') {
				this.communicator.setRotation(overlay.azimuth);
			}
		})
	);

	@AutoSubscription
	backToWorldSuccessSetNorth$ = () => this.actions$.pipe(
		ofType<BackToWorldSuccess>(OverlayStatusActionsTypes.BACK_TO_WORLD_SUCCESS),
		filter((action: BackToWorldSuccess) => action.payload.mapId === this.communicator.id),
		withLatestFrom(this.store$.select(selectMapOrientation(this.mapId))),
		tap(([action, orientation]: [BackToWorldView, MapOrientation]) => {
			this.communicator.setVirtualNorth(0);
			if (orientation === 'Imagery Perspective') {
				this.communicator.setRotation(0);
			}
		})
	);

	constructor(protected actions$: Actions,
				public loggerService: LoggerService,
				public store$: Store<any>,
				protected projectionService: CesiumProjectionService) {
		super();
	}

	onResetView(): Observable<boolean> {
		return of(true);
	};
}
