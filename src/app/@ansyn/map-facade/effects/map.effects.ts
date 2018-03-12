import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { MapFacadeService } from '../services/map-facade.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import 'rxjs/add/operator/share';
import { Store } from '@ngrx/store';
import { IMapState, mapStateSelector } from '../reducers/map.reducer';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import { OpenLayersDisabledMap } from '@ansyn/plugins/openlayers/open-layers-map/disabled-map/open-layers-disabled-map';
import * as intersect from '@turf/intersect';
import { OverlaysService } from '@ansyn/overlays';
import { polygon } from '@turf/helpers';
import { OverlaysService } from "@ansyn/overlays";
import {
	AlertMsgTypes,
	BackToWorldSuccess,
	BackToWorldView,
	CaseMapPosition,
	CoreActionTypes,
	coreStateSelector,
	ICoreState,
	SetLayoutSuccessAction,
	UpdateAlertMsg
} from '@ansyn/core';
import {
	ActiveMapChangedAction,
	AnnotationContextMenuTriggerAction,
	DecreasePendingMapsCountAction,
	ImageryCreatedAction,
	ImageryRemovedAction,
	MapActionTypes,
	MapsListChangedAction,
	PinLocationModeTriggerAction,
	PinPointModeTriggerAction,
	PositionChangedAction,
	SetMapManualImageProcessing,
	SetMapsDataActionStore,
	SynchronizeMapsAction
} from '../actions/map.actions';
import { ContextMenuGetFilteredOverlaysAction, SetMapAutoImageProcessing } from '@ansyn/map-facade';
import 'rxjs/add/observable/forkJoin';
import { openLayersMapName } from '@ansyn/plugins/openlayers/open-layers-map';

@Injectable()
export class MapEffects {

	/**
	 * @type Effect
	 * @name annotationContextMenuTrigger$
	 * @ofType AnnotationContextMenuTriggerAction
	 */
	@Effect({ dispatch: false })
	annotationContextMenuTrigger$ = this.actions$
		.ofType<AnnotationContextMenuTriggerAction>(MapActionTypes.TRIGGER.ANNOTATION_CONTEXT_MENU)
		.share();

	/**
	 * @type Effect
	 * @name onUpdateSize$
	 * @ofType UpdateMapSizeAction
	 */
	@Effect({ dispatch: false })
	onUpdateSize$: Observable<void> = this.actions$
		.ofType(MapActionTypes.UPDATE_MAP_SIZE)
		.map(() => {
			// @TODO move this to service we will need it pass function name and send it to all the maps
			Object.keys(this.communicatorsService.communicators).forEach((imageryId: string) => {
				this.communicatorsService.provide(imageryId).updateSize();
			});
		});

	/**
	 * @type Effect
	 * @name onCommunicatorChange$
	 * @ofType ImageryCreatedAction, ImageryRemovedAction
	 */
	@Effect({ dispatch: false })
	onCommunicatorChange$: Observable<any> = this.actions$
		.ofType(MapActionTypes.IMAGERY_CREATED, MapActionTypes.IMAGERY_REMOVED)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.do(([action, mapState]: [ImageryCreatedAction | ImageryRemovedAction, IMapState]) => {
			if (action instanceof ImageryCreatedAction) {
				this.mapFacadeService.initEmitters(action.payload.id);
			} else {
				this.mapFacadeService.removeEmitters(action.payload.id);
			}
		});

	/**
	 * @type Effect
	 * @name onToggleImageProcessing$
	 * @ofType SetMapAutoImageProcessing
	 * @filter There is a communicator
	 */
	@Effect({ dispatch: false })
	onToggleImageProcessing$: Observable<any> = this.actions$
		.ofType<SetMapAutoImageProcessing>(MapActionTypes.SET_MAP_AUTO_IMAGE_PROCESSING)
		.map(({ payload }) => payload)
		.map(({ mapId, toggleValue }): [CommunicatorEntity, boolean] => [this.communicatorsService.provide(mapId), toggleValue])
		.filter(([comm, toggleValue]) => Boolean(comm))
		.do(([comm, toggleValue]) => {
			comm.setAutoImageProcessing(toggleValue);
		});

	/**
	 * @type Effect
	 * @name onSetManualImageProcessing$
	 * @ofType SetMapManualImageProcessing
	 * @filter There is a communicator
	 */
	@Effect({ dispatch: false })
	onSetManualImageProcessing$: Observable<any> = this.actions$
		.ofType(MapActionTypes.SET_MAP_MANUAL_IMAGE_PROCESSING)
		.map((action: SetMapManualImageProcessing) => [action, this.communicatorsService.provide(action.payload.mapId)])
		.filter(([action, communicator]: [SetMapManualImageProcessing, CommunicatorEntity]) => Boolean(communicator))
		.do(([action, communicator]: [SetMapManualImageProcessing, CommunicatorEntity]) => {
			communicator.setManualImageProcessing(action.payload.processingParams);
		});

	/**
	 * @type Effect
	 * @name onContextMenuShow$
	 * @ofType ContextMenuShowAction
	 */
	@Effect({ dispatch: false })
	onContextMenuShow$: Observable<any> = this.actions$
		.ofType(MapActionTypes.CONTEXT_MENU.SHOW)
		.share();

	/**
	 * @type Effect
	 * @name onMapCreatedDecreasePendingCount$
	 * @ofType ImageryCreatedAction, ImageryRemovedAction
	 * @dependencies pendingMapsCount
	 * @filter pendingMapsCount is greater than 0
	 * @action DecreasePendingMapsCountAction
	 */
	@Effect()
	onMapCreatedDecreasePendingCount$: Observable<any> = this.actions$
		.ofType(MapActionTypes.IMAGERY_REMOVED)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.filter(([action, mapState]) => mapState.pendingMapsCount > 0)
		.map(() => new DecreasePendingMapsCountAction());

	/**
	 * @type Effect
	 * @name onMapPendingCountReachedZero$
	 * @ofType DecreasePendingMapsCountAction
	 * @dependencies pendingMapsCount
	 * @filter pendingMapsCount is 0
	 * @action SetLayoutSuccessAction
	 */
	@Effect()
	onMapPendingCountReachedZero$: Observable<any> = this.actions$
		.ofType(MapActionTypes.DECREASE_PENDING_MAPS_COUNT)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.filter(([action, mapState]) => mapState.pendingMapsCount === 0)
		.map(() => new SetLayoutSuccessAction());

	/**
	 * @type Effect
	 * @name positionChanged$
	 * @ofType PositionChangedAction
	 * @dependencies map
	 * @filter There is a selected map
	 * @action SetMapsDataActionStore
	 */
	@Effect()
	positionChanged$: Observable<any> = this.actions$
		.ofType(MapActionTypes.POSITION_CHANGED)
		.withLatestFrom(this.store$.select(mapStateSelector), (action: PositionChangedAction, state: IMapState): any => {
			return [action, MapFacadeService.mapById(state.mapsList, action.payload.id), state.mapsList];
		})
		.filter(([action, selectedMap, mapsList]) => Boolean(selectedMap) && action.payload.mapInstance === selectedMap)
		.map(([action, selectedMap, mapsList]) => {
			selectedMap.data.position = action.payload.position;
			return new SetMapsDataActionStore({ mapsList: [...mapsList] });
		});

	/**
	 * @type Effect
	 * @name checkImageOutOfBounds$
	 * @ofType PositionChangedAction
	 * @dependencies map
	 * @filter There is a selected map
	 * @action UpdateAlertMsg
	 */
	@Effect()
	checkImageOutOfBounds$: Observable<UpdateAlertMsg> = this.actions$
		.ofType<PositionChangedAction>(MapActionTypes.POSITION_CHANGED)
		.withLatestFrom(this.store$.select(mapStateSelector), ({ payload }, { mapsList }) => MapFacadeService.mapById(mapsList, payload.id))
		.filter(map => Boolean(map))
		.filter(map => OverlaysService.isFullOverlay(map.data.overlay))
		.withLatestFrom(this.store$.select(coreStateSelector))
		.map(([map, { alertMsg }]: [CaseMapState, ICoreState]) => {
			const updatedOverlaysOutOfBounds = new Set(alertMsg.get(AlertMsgTypes.OverlaysOutOfBounds));
			const isWorldView = !OverlaysService.isFullOverlay(map.data.overlay);
			let isInBound;
			if (!isWorldView) {
				const { extentPolygon } = map.data.position;
				const { footprint } = map.data.overlay;
				isInBound = Boolean(intersect(polygon(extentPolygon.coordinates), polygon(footprint.coordinates[0])));
			}
			if (isWorldView || isInBound) {
				updatedOverlaysOutOfBounds.delete(map.id);
			}
			else {
				updatedOverlaysOutOfBounds.add(map.id);
			}
			return new UpdateAlertMsg({ value: updatedOverlaysOutOfBounds, key: AlertMsgTypes.OverlaysOutOfBounds });
		});

	/**
	 * @type Effect
	 * @name checkImageOutOfBounds$
	 * @ofType PositionChangedAction
	 * @dependencies map
	 * @filter There is a selected map
	 * @action UpdateAlertMsg
	 */
	@Effect()
	updateOutOfBoundList: Observable<UpdateAlertMsg> = this.actions$
		.ofType(MapActionTypes.IMAGERY_REMOVED)
		.withLatestFrom(this.store$.select(coreStateSelector))
		.map(([action, { alertMsg }]: [ImageryRemovedAction, ICoreState]) => {
			const updatedOverlaysOutOfBounds = new Set(alertMsg.get(AlertMsgTypes.OverlaysOutOfBounds));
			updatedOverlaysOutOfBounds.delete(action.payload.id);
			return new UpdateAlertMsg({ value: updatedOverlaysOutOfBounds, key: AlertMsgTypes.OverlaysOutOfBounds });
		});


	/**
	 * @type Effect
	 * @name backToWorldView$
	 * @ofType BackToWorldAction
	 * @dependencies map
	 * @action SetMapsDataActionStore, BackToWorldSuccessAction
	 */
	@Effect()
	backToWorldView$: Observable<any> = this.actions$
		.ofType(CoreActionTypes.BACK_TO_WORLD_VIEW)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.switchMap(([{payload}, {mapsList}]: [BackToWorldView, IMapState]) => {
			const mapId = payload.mapId;
			const selectedMap = MapFacadeService.mapById(mapsList, mapId);
			const communicator = this.communicatorsService.provide(mapId);
			const { position } = selectedMap.data;
			const disabledMap = communicator._manager.ActiveMap instanceof OpenLayersDisabledMap;
			const updatedMapsList = [...mapsList];
			updatedMapsList.forEach(
				(map) => {
					if (map.id === mapId) {
						map.data.overlay = null;
						map.data.isAutoImageProcessingActive = false;
					}
				});
			this.store$.dispatch(new SetMapsDataActionStore({ mapsList: updatedMapsList }));
			return Observable.fromPromise(disabledMap ? communicator.setActiveMap(openLayersMapName, position) : communicator.loadInitialMapSource(position))
				.map(() => new BackToWorldSuccess(payload));
		});

	/**
	 * @type Effect
	 * @name onMapsDataActiveMapIdChanged$
	 * @ofType SetMapsDataActionStore
	 * @filter There is an activeMapId
	 * @action ActiveMapChangedAction
	 */
	@Effect()
	onMapsDataActiveMapIdChanged$: Observable<ActiveMapChangedAction> = this.actions$
		.ofType<SetMapsDataActionStore>(MapActionTypes.STORE.SET_MAPS_DATA)
		.map(({ payload }) => payload)
		.filter(({ activeMapId }) => Boolean(activeMapId))
		.map(({ activeMapId }) => new ActiveMapChangedAction(activeMapId));

	/**
	 * @type Effect
	 * @name onMapsData1MapsListChanged$
	 * @ofType SetMapsDataActionStore
	 * @filter There is a mapsList
	 * @action MapsListChangedAction
	 */
	@Effect()
	onMapsData1MapsListChanged$: Observable<MapsListChangedAction> = this.actions$
		.ofType<SetMapsDataActionStore>(MapActionTypes.STORE.SET_MAPS_DATA)
		.map(({ payload }) => payload)
		.filter(({ mapsList }) => Boolean(mapsList))
		.map(({ mapsList }) => new MapsListChangedAction(mapsList));

	/**
	 * @type Effect
	 * @name pinPointModeTriggerAction$
	 * @ofType PinPointModeTriggerAction
	 */
	@Effect({ dispatch: false })
	pinPointModeTriggerAction$: Observable<boolean> = this.actions$
		.ofType<PinPointModeTriggerAction>(MapActionTypes.TRIGGER.PIN_POINT_MODE)
		.map(({ payload }) => payload);

	/**
	 * @type Effect
	 * @name pinLocationModeTriggerAction$
	 * @ofType PinLocationModeTriggerAction
	 */
	@Effect({ dispatch: false })
	pinLocationModeTriggerAction$: Observable<boolean> = this.actions$
		.ofType<PinLocationModeTriggerAction>(MapActionTypes.TRIGGER.PIN_LOCATION_MODE)
		.map(({ payload }) => payload);

	/**
	 * @type Effect
	 * @name getFilteredOverlays$
	 * @ofType ContextMenuGetFilteredOverlaysAction
	 */
	@Effect({ dispatch: false })
	getFilteredOverlays$: Observable<ContextMenuGetFilteredOverlaysAction> = this.actions$
		.ofType<ContextMenuGetFilteredOverlaysAction>(MapActionTypes.CONTEXT_MENU.GET_FILTERED_OVERLAYS)
		.share();

	/**
	 * @type Effect
	 * @name newInstanceInitPosition$
	 * @ofType ImageryCreatedAction
	 * @dispatch: false
	 */
	@Effect()
	newInstanceInitPosition$: Observable<any> = this.actions$
		.ofType<ImageryCreatedAction>(MapActionTypes.IMAGERY_CREATED)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.filter(([{ payload }, { mapsList }]: [ImageryCreatedAction, IMapState]) => !MapFacadeService.mapById(mapsList, payload.id).data.position)
		.switchMap(([{ payload }, mapState]: [ImageryCreatedAction, IMapState]) => {
				const activeMap = MapFacadeService.activeMap(mapState);
				const communicator = this.communicatorsService.provide(payload.id);
				return communicator.setPosition(activeMap.data.position).map(() => [{ payload }, mapState]);
			})
		.mergeMap(([{ payload }, mapState]: [ImageryCreatedAction, IMapState]) => {
			const activeMap = MapFacadeService.activeMap(mapState);
			const actions = [];
			const updatedMapsList = [...mapState.mapsList];
			updatedMapsList.forEach((map: CaseMapState) => {
				if (map.id === payload.id) {
					map.data.position = activeMap.data.position;
				}
			});
			actions.push(new SetMapsDataActionStore({ mapsList: updatedMapsList }));
			if (mapState.pendingMapsCount > 0) {
				actions.push(new DecreasePendingMapsCountAction());
			}
			return actions;
		});

	/**
	 * @type Effect
	 * @name onSynchronizeAppMaps$
	 * @ofType SynchronizeMapsAction
	 * @dependencies maps
	 */
	@Effect({ dispatch: false })
	onSynchronizeAppMaps$: Observable<any> = this.actions$
		.ofType(MapActionTypes.SYNCHRONIZE_MAPS)
		.switchMap((action: SynchronizeMapsAction) => {
			const mapId = action.payload.mapId;
			return this.communicatorsService.provide(mapId).getPosition()
				.map((position: CaseMapPosition) => [position, action]);
		})
		.withLatestFrom(this.store$.select(mapStateSelector))
		.switchMap(([[mapPosition, action], mapState]: [any[], IMapState]) => {
			const mapId = action.payload.mapId;
			if (!mapPosition) {
				const map: CaseMapState = MapFacadeService.mapById(mapState.mapsList, mapId);
				mapPosition = map.data.position;
			}

			const setPositionObservables = [];
			mapState.mapsList.forEach((mapItem: CaseMapState) => {
				if (mapId !== mapItem.id) {
					const comm = this.communicatorsService.provide(mapItem.id);
					setPositionObservables.push(comm.setPosition(mapPosition));
				}
			});

			return Observable.forkJoin(setPositionObservables).map(() => [action, mapState]);
		});

	@Effect()
	imageryCreated$ = this.communicatorsService
		.instanceCreated
		.map((payload) => new ImageryCreatedAction(payload));

	@Effect()
	imageryRemoved$ = this.communicatorsService
		.instanceRemoved
		.map((payload) => new ImageryRemovedAction(payload));

	constructor(protected actions$: Actions,
				protected mapFacadeService: MapFacadeService,
				protected communicatorsService: ImageryCommunicatorService,
				protected store$: Store<any>) {
	}
}
