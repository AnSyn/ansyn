import { Inject, Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { MapFacadeService } from '../services/map-facade.service';
import { EMPTY, forkJoin, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { IMapState, mapStateSelector, selectActiveMapId } from '../reducers/map.reducer';
import {
	BackToWorldSuccess,
	BackToWorldView,
	CaseGeoFilter,
	CoreActionTypes,
	ICaseMapPosition,
	ICaseMapState,
	selectRegion,
	SetLayoutSuccessAction,
	SetMapsDataActionStore,
	SetOverlaysCriteriaAction,
	SetToastMessageAction
} from '@ansyn/core';
import * as turf from '@turf/turf';
import {
	ActiveImageryMouseEnter, ActiveImageryMouseLeave,
	ActiveMapChangedAction,
	AnnotationSelectAction,
	ContextMenuTriggerAction,
	DecreasePendingMapsCountAction,
	ImageryCreatedAction,
	ImageryRemovedAction,
	MapActionTypes,
	MapsListChangedAction,
	PinLocationModeTriggerAction,
	PositionChangedAction,
	SynchronizeMapsAction
} from '../actions/map.actions';
import { CommunicatorEntity, ImageryCommunicatorService } from '@ansyn/imagery';
import { distinctUntilChanged, filter, map, mergeMap, share, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { Position } from 'geojson';
import { mapFacadeConfig } from '../models/map-facade.config';
import { IMapFacadeConfig } from '../models/map-config.model';

@Injectable()
export class MapEffects {

	region$ = this.store$.select(selectRegion);

	isPinPointSearch$ = this.region$.pipe(
		filter(Boolean),
		map((region) => region.type === CaseGeoFilter.PinPoint),
		distinctUntilChanged()
	);

	@Effect()
	onPinPointSearch$: Observable<SetOverlaysCriteriaAction> = this.actions$.pipe(
		ofType<ContextMenuTriggerAction>(MapActionTypes.TRIGGER.CONTEXT_MENU),
		withLatestFrom(this.isPinPointSearch$),
		filter(([{ payload }, isPinPointSearch]: [ContextMenuTriggerAction, boolean]) => isPinPointSearch),
		map(([{ payload }, isPinPointSearch]: [ContextMenuTriggerAction, boolean]) => payload),
		map((payload: Position) => {
			const region = turf.geometry('Point', payload);
			return new SetOverlaysCriteriaAction({ region });
		})
	);


	@Effect({ dispatch: false })
	annotationContextMenuTrigger$ = this.actions$.pipe(
		ofType<AnnotationSelectAction>(MapActionTypes.TRIGGER.ANNOTATION_SELECT),
		share()
	);

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
		ofType(MapActionTypes.IMAGERY_CREATED, MapActionTypes.IMAGERY_REMOVED),
		withLatestFrom(this.store$.select(mapStateSelector)),
		tap(([action, mapState]: [ImageryCreatedAction | ImageryRemovedAction, IMapState]) => {
			if (action instanceof ImageryCreatedAction) {
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
	positionChanged$: Observable<any> = this.actions$.pipe(
		ofType(MapActionTypes.POSITION_CHANGED),
		withLatestFrom(this.store$.select(mapStateSelector), (action: PositionChangedAction, state: IMapState): any => {
			return [action, MapFacadeService.mapById(state.mapsList, action.payload.id), state.mapsList];
		}),
		filter(([action, selectedMap, mapsList]) => Boolean(selectedMap) && action.payload.mapInstance === selectedMap),
		map(([action, selectedMap, mapsList]) => {
			selectedMap.data.position = action.payload.position;
			return new SetMapsDataActionStore({ mapsList: [...mapsList] });
		})
	);

	@Effect()
	backToWorldView$: Observable<any> = this.actions$
		.ofType(CoreActionTypes.BACK_TO_WORLD_VIEW)
		.pipe(
			withLatestFrom(this.store$.select(mapStateSelector)),
			map(([action, mapState]: [BackToWorldView, IMapState]) => {
				const mapId = action.payload.mapId;
				const selectedMap = MapFacadeService.mapById(mapState.mapsList, mapId);
				const communicator = this.communicatorsService.provide(mapId);
				const { position } = selectedMap.data;
				return [action.payload, mapState.mapsList, communicator, position];
			}),
			filter(([payload, mapsList, communicator, position]: [{ mapId: string }, ICaseMapState[], CommunicatorEntity, ICaseMapPosition]) => Boolean(communicator)),
			switchMap(([payload, mapsList, communicator, position]: [{ mapId: string }, ICaseMapState[], CommunicatorEntity, ICaseMapPosition]) => {
				const disabledMap = communicator.mapType === 'disabledOpenLayersMap';
				const updatedMapsList = [...mapsList];
				updatedMapsList.forEach(
					(map) => {
						if (map.id === communicator.id) {
							map.data.overlay = null;
							map.data.isAutoImageProcessingActive = false;
						}
					});
				this.store$.dispatch(new SetMapsDataActionStore({ mapsList: updatedMapsList }));
				return fromPromise(disabledMap ? communicator.setActiveMap('openLayersMap', position) : communicator.loadInitialMapSource(position))
					.pipe(map(() => new BackToWorldSuccess(payload)));
			})
		);

	@Effect()
	onMapsDataActiveMapIdChanged$: Observable<ActiveMapChangedAction> = this.actions$.pipe(
		ofType<SetMapsDataActionStore>(CoreActionTypes.SET_MAPS_DATA),
		map(({ payload }) => payload),
		filter(({ activeMapId }) => Boolean(activeMapId)),
		map(({ activeMapId }) => new ActiveMapChangedAction(activeMapId))
	);

	@Effect()
	onMapsData1MapsListChanged$: Observable<MapsListChangedAction> = this.actions$.pipe(
		ofType<SetMapsDataActionStore>(CoreActionTypes.SET_MAPS_DATA),
		map(({ payload }) => payload),
		filter(({ mapsList }) => Boolean(mapsList)),
		map(({ mapsList }) => new MapsListChangedAction(mapsList))
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
		filter(([{ payload }, { mapsList }]: [ImageryCreatedAction, IMapState]) => !MapFacadeService.mapById(mapsList, payload.id).data.position),
		switchMap(([{ payload }, mapState]: [ImageryCreatedAction, IMapState]) => {
			const activeMap = MapFacadeService.activeMap(mapState);
			const communicator = this.communicatorsService.provide(payload.id);
			return communicator.setPosition(activeMap.data.position).pipe(map(() => [{ payload }, mapState]));
		}),
		mergeMap(([{ payload }, mapState]: [ImageryCreatedAction, IMapState]) => {
			const activeMap = MapFacadeService.activeMap(mapState);
			const actions = [];
			const updatedMapsList = [...mapState.mapsList];
			updatedMapsList.forEach((map: ICaseMapState) => {
				if (map.id === payload.id) {
					map.data.position = activeMap.data.position;
				}
			});
			actions.push(new SetMapsDataActionStore({ mapsList: updatedMapsList }));
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
				map((position: ICaseMapPosition) => [position, action]));
		}),
		withLatestFrom(this.store$.select(mapStateSelector)),
		switchMap(([[mapPosition, action], mapState]: [any[], IMapState]) => {
			const mapId = action.payload.mapId;
			if (!mapPosition) {
				const map: ICaseMapState = MapFacadeService.mapById(mapState.mapsList, mapId);
				mapPosition = map.data.position;
			}

			const setPositionObservables = [];
			mapState.mapsList.forEach((mapItem: ICaseMapState) => {
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
		filter(([id, activeMapId]: [string, string]) => id === activeMapId),
		map(() =>  new ActiveImageryMouseEnter())
	);

	@Effect()
	activeMapLeave$ = this.actions$.pipe(
		ofType(MapActionTypes.TRIGGER.IMAGERY_MOUSE_LEAVE),
		withLatestFrom(this.store$.select(selectActiveMapId)),
		filter(([id, activeMapId]: [string, string]) => id === activeMapId),
		map(() =>  new ActiveImageryMouseLeave())
	);

	constructor(protected actions$: Actions,
				protected mapFacadeService: MapFacadeService,
				protected communicatorsService: ImageryCommunicatorService,
				@Inject(mapFacadeConfig) public config: IMapFacadeConfig,
				protected store$: Store<any>) {
	}

	setPosition(position: ICaseMapPosition, comm, mapItem): Observable<any> {
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
