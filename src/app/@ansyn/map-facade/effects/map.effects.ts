import { Inject, Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { MapFacadeService } from '../services/map-facade.service';
import { EMPTY, forkJoin, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { IMapState, mapStateSelector, selectActiveMapId, selectMaps } from '../reducers/map.reducer';
import {
	geojsonMultiPolygonToPolygon,
	ImageryMapPosition, IMapSettings,
	IWorldViewMapState
} from '@ansyn/imagery';
import {
	ActiveImageryMouseEnter,
	ActiveImageryMouseLeave,
	ChangeImageryMap,
	ChangeImageryMapSuccess,
	DecreasePendingMapsCountAction,
	ImageryCreatedAction,
	ImageryMouseEnter,
	ImageryMouseLeave,
	ImageryRemovedAction,
	MapActionTypes,
	MapInstanceChangedAction,
	PinLocationModeTriggerAction,
	SetMapPositionByRadiusAction,
	SetMapPositionByRectAction,
	SynchronizeMapsAction,
	UpdateMapAction,
	SetWasWelcomeNotificationShownFlagAction,
	SetLayoutSuccessAction,
	BackToWorldView,
	BackToWorldSuccess,
	SetToastMessageAction
} from '../actions/map.actions';
import { CommunicatorEntity, ImageryCommunicatorService } from '@ansyn/imagery';
import { catchError, filter, map, mergeMap, share, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { mapFacadeConfig } from '../models/map-facade.config';
import { IMapFacadeConfig } from '../models/map-config.model';
import { Dictionary } from '@ngrx/entity/src/models';
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
		ofType(MapActionTypes.IMAGERY_REMOVED),
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

	@Effect()
	backToWorldView$: Observable<any> = this.actions$
		.pipe(
			ofType(MapActionTypes.BACK_TO_WORLD_VIEW),
			withLatestFrom(this.store$.select(selectMaps)),
			filter(([action, entities]: [BackToWorldView, Dictionary<IMapSettings>]) => Boolean(entities[action.payload.mapId])),
			map(([action, entities]: [BackToWorldView, Dictionary<IMapSettings>]) => {
				const mapId = action.payload.mapId;
				const selectedMap = entities[mapId];
				const communicator = this.communicatorsService.provide(mapId);
				const { position } = selectedMap.data;
				return [action.payload, selectedMap, communicator, position];
			}),
			filter(([payload, selectedMap, communicator, position]: [{ mapId: string }, IMapSettings, CommunicatorEntity, ImageryMapPosition]) => Boolean(communicator)),
			switchMap(([payload, selectedMap, communicator, position]: [{ mapId: string }, IMapSettings, CommunicatorEntity, ImageryMapPosition]) => {
				const disabledMap = communicator.activeMapName === 'disabledOpenLayersMap';
				this.store$.dispatch(new UpdateMapAction({
					id: communicator.id,
					changes: { data: { ...selectedMap.data, overlay: null, isAutoImageProcessingActive: false } }
				}));
				return fromPromise(disabledMap ? communicator.setActiveMap('openLayersMap', position) : communicator.loadInitialMapSource(position))
					.pipe(
						map(() => new BackToWorldSuccess(payload)),
						catchError((err) => {
							console.error('BACK_TO_WORLD_VIEW ', err);
							this.store$.dispatch(new SetToastMessageAction({ toastText: 'Failed to load map', showWarningIcon: true}));
							return EMPTY;
						})
					);
			})
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
		filter(([{ payload }, { entities }]: [ImageryCreatedAction, IMapState]) => !MapFacadeService.mapById(Object.values(entities), payload.id).data.position),
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
		switchMap((action: SynchronizeMapsAction) => {
			const mapId = action.payload.mapId;
			return this.communicatorsService.provide(mapId).getPosition().pipe(
				map((position: ImageryMapPosition) => [position, action]));
		}),
		withLatestFrom(this.store$.select(mapStateSelector)),
		switchMap(([[mapPosition, action], mapState]: [any[], IMapState]) => {
			const mapId = action.payload.mapId;
			if (!mapPosition) {
				const map: IMapSettings = mapState.entities[mapId];
				if (map.data.overlay) {
					mapPosition = { extentPolygon: geojsonMultiPolygonToPolygon(map.data.overlay.footprint)};
				} else {
					mapPosition = map.data.position;
				}
			}

			const setPositionObservables = [];
			Object.values(mapState.entities).forEach((mapItem: IMapSettings) => {
				if (mapId !== mapItem.id) {
					const comm = this.communicatorsService.provide(mapItem.id);
					setPositionObservables.push(this.setPosition(mapPosition, comm, mapItem));
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
			return fromPromise(communicator.setActiveMap(mapType, mapsEntities[id].data.position, sourceType)).pipe(
				map(() => {
					sourceType = sourceType || communicator.mapSettings.worldView.sourceType;
					const worldView: IWorldViewMapState = { mapType, sourceType };
					return new ChangeImageryMapSuccess({ id, worldView });
				}),
				catchError((err) => {
					console.error('CHANGE_IMAGERY_MAP ', err);
					this.store$.dispatch(new SetToastMessageAction({ toastText: 'Failed to change map', showWarningIcon: true}));
					return EMPTY;
				})
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


	constructor(protected actions$: Actions,
				protected mapFacadeService: MapFacadeService,
				protected communicatorsService: ImageryCommunicatorService,
				@Inject(mapFacadeConfig) public config: IMapFacadeConfig,
				protected store$: Store<any>) {
	}

	setPosition(position: ImageryMapPosition, comm, mapItem): Observable<any> {
		if (mapItem.data.overlay) {
			const isNotIntersect = MapFacadeService.isNotIntersect(position.extentPolygon, mapItem.data.overlay.footprint, this.config.overlayCoverage);
			if (isNotIntersect) {
				this.store$.dispatch(new SetToastMessageAction({
					toastText: 'At least one map couldn\'t be synchronized',
					showWarningIcon: true
				}));
				return EMPTY;
			}
		}
		return comm.setPosition(position);
	}

}
