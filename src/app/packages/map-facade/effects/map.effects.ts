import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { MapFacadeService } from '../services/map-facade.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import {
	ActiveMapChangedAction,
	AnnotationContextMenuTriggerAction,
	BackToWorldAction,
	EnableMapGeoOptionsActionStore,
	MapActionTypes,
	MapsListChangedAction,
	PinLocationModeTriggerAction,
	PinPointModeTriggerAction,
	PositionChangedAction,
	SetLayoutAction,
	SetMapsDataActionStore
} from '../actions/map.actions';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { isEmpty as _isEmpty, isNil as _isNil } from 'lodash';
import 'rxjs/add/operator/share';
import { Action, Store } from '@ngrx/store';
import { IMapState, mapStateSelector } from '../reducers/map.reducer';
import { CaseMapState } from '@ansyn/core/models/case.model';


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
	 * @ofType AddMapInstanceAction, RemoveMapInstanceAction, MapInstanceChangedAction
	 */
	@Effect({ dispatch: false })
	onCommunicatorChange$: Observable<any> = this.actions$
		.ofType(MapActionTypes.ADD_MAP_INSTANCE, MapActionTypes.REMOVE_MAP_INSTACNE, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
		.map(() => this.mapFacadeService.initEmitters());

	/**
	 * @type Effect
	 * @name onToggleImageProcessing$
	 * @ofType SetMapAutoImageProcessing
	 * @filter There is a communicator
	 */
	@Effect({ dispatch: false })
	onToggleImageProcessing$: Observable<any> = this.actions$
		.ofType(MapActionTypes.SET_MAP_AUTO_IMAGE_PROCESSING)
		.map(toPayload)
		.map(({ mapId, toggleValue }) => [this.communicatorsService.provide(mapId), toggleValue])
		.filter(([comm]) => !_isNil(comm))
		.do(([comm, toggleValue]) => {
			comm.setAutoImageProcessing(toggleValue);
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
	 * @name onLayoutsChange$
	 * @ofType SetLayoutAction
	 * @dependencies map
	 * @filter mapsCount and mapsList length are not equal
	 * @action SetMapsDataActionStore
	 */
	@Effect()
	onLayoutsChange$: Observable<SetMapsDataActionStore> = this.actions$
		.ofType<SetLayoutAction>(MapActionTypes.SET_LAYOUT)
		.withLatestFrom(this.store$.select(mapStateSelector).pluck<any, any>('mapsList'), this.store$.select(mapStateSelector).pluck('activeMapId'))
		.filter(([{ payload }, mapsList]) => payload.mapsCount !== mapsList.length && mapsList.length > 0)
		.map(([{ payload }, mapsList, activeMapId]) => MapFacadeService.setMapsDataChanges(mapsList, activeMapId, payload))
		.map((newData) => new SetMapsDataActionStore(newData));

	/**
	 * @type Effect
	 * @name positionChanged$
	 * @ofType PositionChangedAction
	 * @dependencies map
	 * @filter There is a selected map
	 * @action SetMapsDataActionStore
	 */
	@Effect()
	positionChanged$: Observable<SetMapsDataActionStore> = this.actions$
		.ofType(MapActionTypes.POSITION_CHANGED)
		.withLatestFrom(this.store$.select(mapStateSelector), (action: PositionChangedAction, state: IMapState): any => {
			return [MapFacadeService.mapById(state.mapsList, action.payload.id), state.mapsList, action.payload.position];
		})
		.filter(([selectedMap]) => !_isEmpty(selectedMap))
		.map(([selectedMap, mapsList, position]) => {
			selectedMap.data.position = position;
			return new SetMapsDataActionStore({ mapsList: [...mapsList] });
		});

	/**
	 * @type Effect
	 * @name backToWorldView$
	 * @ofType BackToWorldAction
	 * @dependencies map
	 * @action SetMapsDataActionStore
	 */
	@Effect()
	backToWorldView$: Observable<any> = this.actions$
		.ofType(MapActionTypes.BACK_TO_WORLD)
		.withLatestFrom(this.store$.select(mapStateSelector), (action: BackToWorldAction, mapState: IMapState) => {
			const mapId = action.payload.mapId ? action.payload.mapId : mapState.activeMapId;
			return [action, mapId, mapState.mapsList];
		})
		.map(([action, mapId, mapsList]: [BackToWorldAction, string, CaseMapState[]]) => {

			const selectedMap = MapFacadeService.mapById(mapsList, mapId);
			const comm = this.communicatorsService.provide(mapId);
			comm.loadInitialMapSource(selectedMap.data.position.boundingBox);

			const updatedMapsList = [...mapsList];
			updatedMapsList.forEach(
				(map) => {
					if (map.id === mapId) {
						map.data.overlay = null;
						map.data.isAutoImageProcessingActive = false;
					}
				});
			return new SetMapsDataActionStore({ mapsList: updatedMapsList });
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
		.ofType(MapActionTypes.STORE.SET_MAPS_DATA)
		.map(toPayload)
		.filter(({ activeMapId }) => !_isNil(activeMapId))
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
		.ofType(MapActionTypes.STORE.SET_MAPS_DATA)
		.map(toPayload)
		.filter(({ mapsList }) => !_isNil(mapsList))
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
	getFilteredOverlays$: Observable<Action> = this.actions$
		.ofType(MapActionTypes.CONTEXT_MENU.GET_FILTERED_OVERLAYS)
		.share();

	/**
	 * @type Effect
	 * @name backToWorldGeoRegistration$
	 * @ofType BackToWorldAction
	 * @dependencies map
	 * @filter Exists a communicator for the mapId
	 */
	@Effect({ dispatch: false })
	backToWorldGeoRegistration$: Observable<any> = this.actions$
		.ofType(MapActionTypes.BACK_TO_WORLD)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.map(([action, mapState]: [any, any]): any[] => {
			const mapId = action.payload.mapId ? action.payload.mapId : mapState.activeMapId;
			const map = MapFacadeService.mapById(mapState.mapsList, mapId);
			const mapComm = this.communicatorsService.provide(mapId);
			return [mapComm, map.data.position];
		})
		.filter(([mapComm]) => Boolean(mapComm))
		.do(([mapComm, position]: any[]) => {
			mapComm.setActiveMap('openLayersMap', position);
		});

	/**
	 * @type Effect
	 * @name activeMapGeoRegistrationChanged$
	 * @ofType DisplayOverlaySuccessAction, ActiveMapChangedAction
	 * @dependencies map
	 * @filter mapsList.length > 0
	 * @action EnableMapGeoOptionsActionStore
	 */
	@Effect()
	activeMapGeoRegistrationChanged$: Observable<any> = this.actions$
		.ofType(MapActionTypes.TRIGGER.MAPS_LIST_CHANGED, MapActionTypes.TRIGGER.ACTIVE_MAP_CHANGED)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.filter(([action, mapState]: [Action, IMapState]) => mapState.mapsList.length > 0)
		.map(([action, mapState]: [Action, IMapState]) => {
			const activeMapState = MapFacadeService.activeMap(mapState);
			const isGeoRegistered = MapFacadeService.isOverlayGeoRegistered(activeMapState.data.overlay);
			return [action, isGeoRegistered, activeMapState, mapState];
		})
		.filter(([action, isGeoRegistered, activeMapState, mapState]: [Action, boolean, CaseMapState, IMapState]): any => {
			const isEnabled = mapState.mapIdToGeoOptions.get(activeMapState.id);
			return isEnabled !== isGeoRegistered;
		})
		.map(([action, isGeoRegistered, activeMapState]: [Action, boolean, CaseMapState, IMapState]): any => {
			return new EnableMapGeoOptionsActionStore({ mapId: activeMapState.id, isEnabled: isGeoRegistered });
		});

	constructor(private actions$: Actions,
				private mapFacadeService: MapFacadeService,
				private communicatorsService: ImageryCommunicatorService,
				private store$: Store<any>) {
	}
}
