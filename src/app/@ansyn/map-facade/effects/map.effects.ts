import { Inject, Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { MapFacadeService } from '../services/map-facade.service';
import { EMPTY, forkJoin, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { IMapState, mapStateSelector, selectActiveMapId, selectMaps } from '../reducers/map.reducer';
import {
	BackToWorldSuccess,
	BackToWorldView,
	CaseGeoFilter,
	CoreActionTypes,
	ICaseMapPosition,
	ICaseMapState,
	selectRegion,
	SetLayoutSuccessAction,
	SetOverlaysCriteriaAction,
	SetToastMessageAction
} from '@ansyn/core';
import * as turf from '@turf/turf';
import {
	ActiveImageryMouseEnter,
	ActiveImageryMouseLeave,
	AnnotationSelectAction,
	ChangeImageryMap,
	ChangeImageryMapSuccess,
	ContextMenuTriggerAction,
	DecreasePendingMapsCountAction,
	ImageryCreatedAction,
	ImageryRemovedAction,
	MapActionTypes,
	PinLocationModeTriggerAction,
	PositionChangedAction,
	SynchronizeMapsAction,
	UpdateMapAction
} from '../actions/map.actions';
import { CommunicatorEntity, ImageryCommunicatorService } from '@ansyn/imagery';
import { distinctUntilChanged, filter, map, mergeMap, share, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { Position } from 'geojson';
import { mapFacadeConfig } from '../models/map-facade.config';
import { IMapFacadeConfig } from '../models/map-config.model';
import { Dictionary } from '@ngrx/entity/src/models';

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
	backToWorldView$: Observable<any> = this.actions$
		.ofType(CoreActionTypes.BACK_TO_WORLD_VIEW)
		.pipe(
			withLatestFrom(this.store$.select(selectMaps)),
			map(([action, entities]: [BackToWorldView, Dictionary<ICaseMapState>]) => {
				const mapId = action.payload.mapId;
				const selectedMap = entities[mapId];
				const communicator = this.communicatorsService.provide(mapId);
				const { position } = selectedMap.data;
				return [action.payload, selectedMap, communicator, position];
			}),
			filter(([payload, selectedMap, communicator, position]: [{ mapId: string }, ICaseMapState, CommunicatorEntity, ICaseMapPosition]) => Boolean(communicator)),
			switchMap(([payload, selectedMap, communicator, position]: [{ mapId: string }, ICaseMapState, CommunicatorEntity, ICaseMapPosition]) => {
				const disabledMap = communicator.activeMapName === 'disabledOpenLayersMap';
				this.store$.dispatch(new UpdateMapAction({
					id: communicator.id,
					changes: { data: { ...selectedMap.data, overlay: null, isAutoImageProcessingActive: false } }
				}));
				return fromPromise(disabledMap ? communicator.setActiveMap('openLayersMap', position) : communicator.loadInitialMapSource(position))
					.pipe(map(() => new BackToWorldSuccess(payload)));
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
				map((position: ICaseMapPosition) => [position, action]));
		}),
		withLatestFrom(this.store$.select(mapStateSelector)),
		switchMap(([[mapPosition, action], mapState]: [any[], IMapState]) => {
			const mapId = action.payload.mapId;
			if (!mapPosition) {
				const map: ICaseMapState = mapState.entities[mapId];
				mapPosition = map.data.position;
			}

			const setPositionObservables = [];
			Object.values(mapState.entities).forEach((mapItem: ICaseMapState) => {
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
		map(() => new ActiveImageryMouseEnter())
	);

	@Effect()
	activeMapLeave$ = this.actions$.pipe(
		ofType(MapActionTypes.TRIGGER.IMAGERY_MOUSE_LEAVE),
		withLatestFrom(this.store$.select(selectActiveMapId)),
		filter(([id, activeMapId]: [string, string]) => id === activeMapId),
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
					const worldView = { mapType, sourceType: sourceType || communicator.mapSettings.worldView.sourceType };
					return new ChangeImageryMapSuccess({ id, worldView });
				})
			);
		})
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
