import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { MapFacadeService } from '../services/map-facade.service';
import { Observable, UnaryFunction } from 'rxjs';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/share';
import { Store } from '@ngrx/store';
import { IMapState, mapStateSelector } from '../reducers/map.reducer';
import { CaseGeoFilter, ICaseMapState } from '@ansyn/core/models/case.model';
import { OpenLayersDisabledMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';
import * as turf from '@turf/turf';
import { intersect, polygon } from '@turf/turf';

import 'rxjs/add/observable/forkJoin';
import {
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
} from '@ansyn/map-facade/actions/map.actions';
import {
	AddAlertMsg,
	BackToWorldSuccess,
	BackToWorldView,
	CoreActionTypes,
	RemoveAlertMsg,
	SetLayoutSuccessAction,
	SetMapsDataActionStore,
	SetOverlaysCriteriaAction
} from '@ansyn/core/actions/core.actions';
import { AlertMsgTypes, selectRegion } from '@ansyn/core/reducers/core.reducer';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { ICaseMapPosition } from '@ansyn/core/models/case-map-position.model';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import { distinctUntilChanged, filter, map, mergeMap, share, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { pipe } from 'rxjs/internal-compatibility';
import { Position } from 'geojson';

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

	checkOverlaysOutOfBounds$: UnaryFunction<any, any> = pipe(
		filter(Boolean),
		map((map: ICaseMapState) => {
			const key = AlertMsgTypes.OverlaysOutOfBounds;
			const isWorldView = !OverlaysService.isFullOverlay(map.data.overlay);
			let isInBound;
			if (!isWorldView) {
				const { extentPolygon } = map.data.position;
				const { footprint } = map.data.overlay;
				try {
					isInBound = Boolean(intersect(polygon(extentPolygon.coordinates), polygon(footprint.coordinates[0])));
				} catch (e) {
					console.warn('checkImageOutOfBounds$: turf exception', e);
				}
			}

			if (isWorldView || isInBound) {
				return new RemoveAlertMsg({ key, value: map.id });
			}

			return new AddAlertMsg({ key, value: map.id });

		})
	);

	@Effect()
	checkImageOutOfBounds$: Observable<AddAlertMsg | RemoveAlertMsg> = this.actions$
		.pipe(
			ofType<PositionChangedAction>(MapActionTypes.POSITION_CHANGED),
			withLatestFrom(this.store$.select(mapStateSelector), ({ payload }, { mapsList }) => MapFacadeService.mapById(mapsList, payload.id)),
			this.checkOverlaysOutOfBounds$.bind(this)
		);

	@Effect()
	checkImageOutOfBoundsFromBackToWorlds$: Observable<AddAlertMsg | RemoveAlertMsg> = this.actions$
		.pipe(
			ofType<BackToWorldSuccess>(CoreActionTypes.BACK_TO_WORLD_SUCCESS),
			withLatestFrom(this.store$.select(mapStateSelector), ({ payload }, { mapsList }) => MapFacadeService.mapById(mapsList, payload.mapId)),
			this.checkOverlaysOutOfBounds$.bind(this)
		);

	@Effect()
	updateOutOfBoundList: Observable<RemoveAlertMsg> = this.actions$.pipe(
		ofType(MapActionTypes.IMAGERY_REMOVED),
		map((action: ImageryRemovedAction) => {
			return new RemoveAlertMsg({ key: AlertMsgTypes.OverlaysOutOfBounds, value: action.payload.id });
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
				const disabledMap = communicator.ActiveMap instanceof OpenLayersDisabledMap;
				const updatedMapsList = [...mapsList];
				updatedMapsList.forEach(
					(map) => {
						if (map.id === communicator.id) {
							map.data.overlay = null;
							map.data.isAutoImageProcessingActive = false;
						}
					});
				this.store$.dispatch(new SetMapsDataActionStore({ mapsList: updatedMapsList }));
				return Observable.fromPromise(disabledMap ? communicator.setActiveMap(OpenlayersMapName, position) : communicator.loadInitialMapSource(position))
					.map(() => new BackToWorldSuccess(payload));
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
			return communicator.setPosition(activeMap.data.position).map(() => [{ payload }, mapState]);
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
			return this.communicatorsService.provide(mapId).getPosition()
				.map((position: ICaseMapPosition) => [position, action]);
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
					setPositionObservables.push(comm.setPosition(mapPosition));
				}
			});

			return Observable.forkJoin(setPositionObservables).map(() => [action, mapState]);
		})
	);

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
