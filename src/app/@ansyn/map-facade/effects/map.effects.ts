import { Inject, Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { MapFacadeService } from '../services/map-facade.service';
import { EMPTY, forkJoin, Observable, from } from 'rxjs';
import { Store } from '@ngrx/store';
import { IMapState, mapStateSelector, selectActiveMapId, selectMaps } from '../reducers/map.reducer';
import { ImageryCommunicatorService, IMapSettings, IMapSettingsData, IWorldViewMapState } from '@ansyn/imagery';
import {
	ActiveImageryMouseEnter,
	ActiveImageryMouseLeave,
	ChangeImageryMap,
	ChangeImageryMapFailed,
	ChangeImageryMapSuccess, ReplaceMainLayer,
	DecreasePendingMapsCountAction,
	ImageryCreatedAction,
	ImageryMouseEnter,
	ImageryMouseLeave,
	ImageryRemovedAction,
	MapActionTypes,
	MapInstanceChangedAction,
	PinLocationModeTriggerAction,
	SetLayoutSuccessAction,
	SetMapPositionByRadiusAction,
	SetMapPositionByRectAction,
	SetToastMessageAction,
	SetWasWelcomeNotificationShownFlagAction,
	SynchronizeMapsAction,
	UpdateMapAction,
	ReplaceMainLayerSuccess,
	ReplaceMainLayerFailed
} from '../actions/map.actions';
import { catchError, filter, map, mergeMap, share, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { mapFacadeConfig } from '../models/map-facade.config';
import { IMapFacadeConfig } from '../models/map-config.model';
import { updateSession } from '../models/core-session-state.model';

@Injectable()
export class MapEffects {

	@Effect({ dispatch: false })
	onUpdateSize$: Observable<void> = this.actions$.pipe(
		ofType(MapActionTypes.UPDATE_MAP_SIZE),
		map(() => {
			// @TODO move this to service we will need it pass function name and send it to all the maps
			Object.keys(this.communicatorsService.communicators).forEach((imageryId: string) => {
				this.communicatorsService.provide(imageryId).updateSize();
			});
		})
	);

	@Effect({ dispatch: false })
	onCommunicatorChange$: Observable<any> = this.actions$.pipe(
		ofType(MapActionTypes.IMAGERY_CREATED, MapActionTypes.IMAGERY_REMOVED, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION),
		withLatestFrom(this.store$.select(mapStateSelector)),
		tap(([action, mapState]: [ImageryCreatedAction | ImageryRemovedAction | MapInstanceChangedAction, IMapState]) => {
			if (action instanceof ImageryCreatedAction || action instanceof MapInstanceChangedAction) {
				this.mapFacadeService.initEmitters(action.payload.id);
			} else {
				this.mapFacadeService.removeEmitters(action.payload.id);
			}
		})
	);

	@Effect({ dispatch: false })
	onContextMenuShow$: Observable<any> = this.actions$.pipe(
		ofType(MapActionTypes.CONTEXT_MENU.SHOW),
		share()
	);

	@Effect()
	onMapCreatedDecreasePendingCount$: Observable<any> = this.actions$.pipe(
		ofType(MapActionTypes.IMAGERY_CREATED),
		withLatestFrom(this.store$.select(mapStateSelector)),
		filter(([action, mapState]) => mapState.pendingMapsCount > 0),
		map(() => new DecreasePendingMapsCountAction())
	);

	@Effect()
	onMapPendingCountReachedZero$: Observable<any> = this.actions$.pipe(
		ofType(MapActionTypes.DECREASE_PENDING_MAPS_COUNT),
		withLatestFrom(this.store$.select(mapStateSelector)),
		filter(([action, mapState]) => mapState.pendingMapsCount === 0),
		map(() => new SetLayoutSuccessAction())
	);

	@Effect({ dispatch: false })
	pinLocationModeTriggerAction$: Observable<boolean> = this.actions$.pipe(
		ofType<PinLocationModeTriggerAction>(MapActionTypes.TRIGGER.PIN_LOCATION_MODE),
		map(({ payload }) => payload)
	);

	@Effect()
	newInstanceInitPosition$: Observable<any> = this.actions$.pipe(
		ofType<ImageryCreatedAction>(MapActionTypes.IMAGERY_CREATED),
		withLatestFrom(this.store$.select(mapStateSelector)),
		filter(([{ payload }, { entities }]: [ImageryCreatedAction, IMapState]) => Boolean(entities) && !MapFacadeService.mapById(Object.values(entities), payload.id).data.position),
		switchMap(([{ payload }, mapState]: [ImageryCreatedAction, IMapState]) => {
			const activeMap = MapFacadeService.activeMap(mapState);
			const communicator = this.communicatorsService.provide(payload.id);
			return communicator.setPosition(activeMap.data.position).pipe(map(() => [{ payload }, mapState]));
		}),
		mergeMap(([{ payload }, mapState]: [ImageryCreatedAction, IMapState]) => {
			const activeMap = MapFacadeService.activeMap(mapState);
			const actions = [];
			const updatedMap = mapState.entities[payload.id];
			actions.push(new UpdateMapAction({
				id: payload.id,
				changes: { data: { ...updatedMap.data, position: activeMap.data.position } }
			}));
			if (mapState.pendingMapsCount > 0) {
				actions.push(new DecreasePendingMapsCountAction());
			}
			return actions;
		})
	);


	@Effect({ dispatch: false })
	onSynchronizeAppMaps$: Observable<any> = this.actions$.pipe(
		ofType(MapActionTypes.SYNCHRONIZE_MAPS),
		withLatestFrom(this.store$.select(mapStateSelector)),
		switchMap(([action, mapState]: [SynchronizeMapsAction, IMapState]) => {
			const mapId = action.payload.mapId;
			const mapSettings: IMapSettings = mapState.entities[mapId];
			const mapPosition = mapSettings.data.position;
			const setPositionObservables = [];
			Object.values(mapState.entities).forEach((mapItem: IMapSettings) => {
				if (mapId !== mapItem.id && !mapItem.data.overlay) {
					const comm = this.communicatorsService.provide(mapItem.id);
					setPositionObservables.push(comm.setPosition(mapPosition));
				}
			});

			return forkJoin(setPositionObservables).pipe(map(() => [action, mapState]));
		})
	);

	@Effect()
	imageryCreated$ = this.communicatorsService
		.instanceCreated.pipe(map((payload) => new ImageryCreatedAction(payload)));

	@Effect()
	imageryRemoved$ = this.communicatorsService
		.instanceRemoved.pipe(
			map((payload) => new ImageryRemovedAction(payload)));

	@Effect()
	activeMapEnter$ = this.actions$.pipe(
		ofType(MapActionTypes.TRIGGER.IMAGERY_MOUSE_ENTER),
		withLatestFrom(this.store$.select(selectActiveMapId)),
		filter(([action, activeMapId]: [ImageryMouseEnter, string]) => action.payload === activeMapId),
		map(() => new ActiveImageryMouseEnter())
	);

	@Effect()
	activeMapLeave$ = this.actions$.pipe(
		ofType(MapActionTypes.TRIGGER.IMAGERY_MOUSE_LEAVE),
		withLatestFrom(this.store$.select(selectActiveMapId)),
		filter(([action, activeMapId]: [ImageryMouseLeave, string]) => action.payload === activeMapId),
		map(() => new ActiveImageryMouseLeave())
	);

	@Effect()
	changeImageryMap$ = this.actions$.pipe(
		ofType<ChangeImageryMap>(MapActionTypes.CHANGE_IMAGERY_MAP),
		withLatestFrom(this.store$.select(selectMaps)),
		mergeMap(([{ payload: { id, mapType, sourceType } }, mapsEntities]) => {
			const communicator = this.communicatorsService.provide(id);
			return from(communicator.setActiveMap(mapType, mapsEntities[id].data.position, sourceType)).pipe(
				map(() => {
					sourceType = sourceType || communicator.mapSettings.worldView.sourceType;
					const worldView: IWorldViewMapState = { mapType, sourceType };
					return new ChangeImageryMapSuccess({ id, worldView });
				}),
				catchError((err) => {
					this.store$.dispatch(new SetToastMessageAction({
						toastText: 'Failed to change map',
						showWarningIcon: true
					}));
					this.store$.dispatch(new ChangeImageryMapFailed({ id, error: err }));
					return EMPTY;
				})
			);
		})
	);

	@Effect()
	changeImageryLayer$ = this.actions$.pipe(
		ofType<ReplaceMainLayer>(MapActionTypes.REPLACE_MAP_MAIN_LAYER),
		switchMap(({ payload }) => {
			const communicator = this.communicatorsService.provide(payload.id);
			return communicator.replaceMapMainLayer(payload.sourceType).pipe(
				map(change => change ? new ReplaceMainLayerSuccess(payload) : new ReplaceMainLayerFailed())
			);
		})
	);

	@Effect({ dispatch: false })
	setMapPositionByRect$ = this.actions$.pipe(
		ofType<SetMapPositionByRectAction>(MapActionTypes.SET_MAP_POSITION_BY_RECT),
		switchMap(({ payload: { id, rect } }: SetMapPositionByRectAction) => {
			const communicator = this.communicatorsService.provide(id);
			const result$ = communicator ? communicator.setPositionByRect(rect) : EMPTY;
			return result$;
		})
	);

	@Effect({ dispatch: false })
	setMapPositionByRadius$ = this.actions$.pipe(
		ofType<SetMapPositionByRadiusAction>(MapActionTypes.SET_MAP_POSITION_BY_RADIUS),
		switchMap(({ payload: { id, center, radiusInMeters } }: SetMapPositionByRadiusAction) => {
			const communicator = this.communicatorsService.provide(id);
			const result$ = communicator ? communicator.setPositionByRadius(center, radiusInMeters) : EMPTY;
			return result$;
		})
	);

	@Effect({ dispatch: false })
	onWelcomeNotification$: Observable<any> = this.actions$
		.pipe(
			ofType(MapActionTypes.SET_WAS_WELCOME_NOTIFICATION_SHOWN_FLAG),
			tap((action: SetWasWelcomeNotificationShownFlagAction) => {
				const payloadObj = { wasWelcomeNotificationShown: action.payload };
				updateSession(payloadObj);
			})
		);

	@Effect({dispatch: false})
	onForceMapsRender$ = this.actions$.pipe(
		ofType(MapActionTypes.FORCE_RENDER_MAPS)
	);


	constructor(protected actions$: Actions,
				protected mapFacadeService: MapFacadeService,
				protected communicatorsService: ImageryCommunicatorService,
				@Inject(mapFacadeConfig) public config: IMapFacadeConfig,
				protected store$: Store<any>) {
	}
}
