import { Inject, Injectable } from '@angular/core';
import { Actions, Effect, ofType, createEffect } from '@ngrx/effects';
import { MapFacadeService } from '../services/map-facade.service';
import { EMPTY, forkJoin, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { IMapState, mapStateSelector, selectActiveMapId, selectMaps } from '../reducers/map.reducer';
import {
	geojsonMultiPolygonToBBOXPolygon,
	ImageryCommunicatorService,
	ImageryMapPosition,
	IMapSettings,
	IWorldViewMapState
} from '@ansyn/imagery';
import {
	ActiveImageryMouseEnter,
	ActiveImageryMouseLeave,
	ChangeImageryMap,
	ChangeImageryMapFailed,
	ChangeImageryMapSuccess,
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
	UpdateMapSizeAction
} from '../actions/map.actions';
import { catchError, filter, map, mergeMap, share, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { mapFacadeConfig } from '../models/map-facade.config';
import { IMapFacadeConfig } from '../models/map-config.model';
import { updateSession } from '../models/core-session-state.model';
import { Polygon, Point } from 'geojson';

@Injectable()
export class MapEffects {

	onUpdateSize$ = createEffect(() => this.actions$.pipe(
		ofType(UpdateMapSizeAction),
		map(() => {
			// @TODO move this to service we will need it pass function name and send it to all the maps
			Object.keys(this.communicatorsService.communicators)
				.forEach((imageryId: string) => {
					this.communicatorsService.provide(imageryId).updateSize();
			});
		})),
		{ dispatch: false }
	);

	onCommunicatorChange$ = createEffect(() => this.actions$.pipe(
		ofType(MapActionTypes.IMAGERY_CREATED, MapActionTypes.IMAGERY_REMOVED, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION),
		withLatestFrom(this.store$.select(mapStateSelector)),
		tap(([action, mapState]: [ImageryCreatedAction | ImageryRemovedAction | MapInstanceChangedAction, IMapState]) => {
			if (action instanceof ImageryCreatedAction || action instanceof MapInstanceChangedAction) {
				this.mapFacadeService.initEmitters(action.payload.id);
			} else {
				this.mapFacadeService.removeEmitters(action.payload.id);
			}
		})),
		{ dispatch: false }
	);

	@Effect({ dispatch: false })
	onContextMenuShow$: Observable<any> = this.actions$.pipe(
		ofType(MapActionTypes.CONTEXT_MENU.SHOW),
		share()
	);

	onMapCreatedDecreasePendingCount$ = createEffect(() =>this.actions$.pipe(
		ofType(ImageryCreatedAction),
		withLatestFrom(this.store$.select(mapStateSelector)),
		filter(([, mapState]) => mapState.pendingMapsCount > 0),
		map(() => DecreasePendingMapsCountAction()))
	);

	onMapPendingCountReachedZero$ = createEffect(() => this.actions$.pipe(
		ofType(DecreasePendingMapsCountAction),
		withLatestFrom(this.store$.select(mapStateSelector)),
		filter(([, mapState]) => mapState.pendingMapsCount === 0),
		map(() => SetLayoutSuccessAction()))
	);

	pinLocationModeTriggerAction$ = createEffect(() => this.actions$.pipe(
		ofType(PinLocationModeTriggerAction),
		map(payload => payload)),
	{ dispatch: false }
	);

	newInstanceInitPosition$ = createEffect(() => this.actions$.pipe(
		ofType(ImageryCreatedAction),
		withLatestFrom(this.store$.select(mapStateSelector)),
		filter(([{ payload }, { entities }]: [{payload: string}, IMapState]) => Boolean(entities) && !MapFacadeService.mapById(Object.values(entities), payload.id).data.position),
		switchMap(([{ payload }, mapState]: [{payload: string}, IMapState]) => {
			const activeMap = MapFacadeService.activeMap(mapState);
			const communicator = this.communicatorsService.provide(payload.id);
			return communicator.setPosition(activeMap.data.position).pipe(map(() => [{ payload }, mapState]));
		}),
		mergeMap(([payload, mapState]: [{payload: string}, IMapState]) => {
			const activeMap = MapFacadeService.activeMap(mapState);
			const actions = [];
			const updatedMap = mapState.entities[payload.id];
			actions.push(UpdateMapAction({
				id: payload.id,
				changes: { data: { ...updatedMap.data, position: activeMap.data.position } }
			}));
			if (mapState.pendingMapsCount > 0) {
				actions.push(DecreasePendingMapsCountAction());
			}
			return actions;
		}))
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
				if (mapId !== mapItem.id) {
					const comm = this.communicatorsService.provide(mapItem.id);
					setPositionObservables.push(this.setPosition(mapPosition, comm, mapItem));
				}
			});

			return forkJoin(setPositionObservables).pipe(map(() => [action, mapState]));
		})
	);

	imageryCreated$ = createEffect(() => this.communicatorsService
		.instanceCreated.pipe(map(payload => ImageryCreatedAction({ payload: payload.id })))
	);

	imageryRemoved$ = createEffect(() => this.communicatorsService
		.instanceRemoved.pipe(
			map(payload => ImageryRemovedAction({ payload: payload.id })))
	);

	activeMapEnter$ = createEffect(() => this.actions$.pipe(
		ofType(MapActionTypes.TRIGGER.IMAGERY_MOUSE_ENTER),
		withLatestFrom(this.store$.select(selectActiveMapId)),
		filter(([action, activeMapId]: [ImageryMouseEnter, string]) => action.payload === activeMapId),
		map(() => ActiveImageryMouseEnter())
	));

	activeMapLeave$ =  createEffect(() => this.actions$.pipe(
		ofType(MapActionTypes.TRIGGER.IMAGERY_MOUSE_LEAVE),
		withLatestFrom(this.store$.select(selectActiveMapId)),
		filter(([action, activeMapId]: [ImageryMouseLeave, string]) => action.payload === activeMapId),
		map(() => ActiveImageryMouseLeave()))
	);

	changeImageryMap$ = createEffect(() => this.actions$.pipe(
		ofType(ChangeImageryMap),
		withLatestFrom(this.store$.select(selectMaps)),
		mergeMap(([{ payload: { id, mapType, sourceType } }, mapsEntities]) => {
			const communicator = this.communicatorsService.provide(id);
			return fromPromise(communicator.setActiveMap(mapType, mapsEntities[id].data.position, sourceType)).pipe(
				map(() => {
					sourceType = sourceType || communicator.mapSettings.worldView.sourceType;
					const worldView: IWorldViewMapState = { mapType, sourceType };
					return ChangeImageryMapSuccess({ id, worldView });
				}),
				catchError((err) => {
					this.store$.dispatch(SetToastMessageAction({
						toastText: 'Failed to change map',
						showWarningIcon: true
					}));
					this.store$.dispatch(ChangeImageryMapFailed({ id, error: err }));
					return EMPTY;
				})
			);
		}))
	);

	setMapPositionByRect$ = createEffect(() => this.actions$.pipe(
		ofType(SetMapPositionByRectAction),
		switchMap((payload: { id: string; rect: Polygon }) => {
			const communicator = this.communicatorsService.provide(payload.id);
			const result$ = communicator ? communicator.setPositionByRect(payload.rect) : EMPTY;
			return result$;
		})),
		{ dispatch: false }
	);

	setMapPositionByRadius$ = createEffect(()  => this.actions$.pipe(
		ofType(SetMapPositionByRadiusAction),
		switchMap((payload: { id: string; center: Point; radiusInMeters: number }) => {
			const communicator = this.communicatorsService.provide(payload.id);
			const result$ = communicator ? communicator.setPositionByRadius(payload.center, payload.radiusInMeters) : EMPTY;
			return result$;
		})),
		{ dispatch: false }
	);

	onWelcomeNotification$ = createEffect(() => this.actions$
		.pipe(
			ofType(SetWasWelcomeNotificationShownFlagAction),
			tap((payload) => {
				const payloadObj = { wasWelcomeNotificationShown: payload };
				updateSession(payloadObj);
			})
		),
		{ dispatch: false }
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
				this.store$.dispatch(SetToastMessageAction({
					toastText: 'At least one map couldn\'t be synchronized',
					showWarningIcon: true
				}));
				return EMPTY;
			}
		}
		return comm.setPosition(position);
	}
}
