import { Inject, Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import {
	DisplayOverlayFailedAction,
	DisplayOverlaySuccessAction,
	LoadOverlaysAction,
	OverlaysActionTypes,
	OverlaysMarkupAction,
	RequestOverlayByIDFromBackendAction,
	SyncFilteredOverlays
} from '@ansyn/overlays/actions/overlays.actions';
import { Overlay } from '@ansyn/overlays/models/overlay.model';
import { BaseMapSourceProvider, ImageryCommunicatorService } from '@ansyn/imagery';
import {
	LayersActionTypes,
	SelectLayerAction,
	UnselectLayerAction
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { IAppState } from '../';
import { Case, CasesService, ICasesState, UpdateCaseAction } from '@ansyn/menu-items/cases';
import {
	CompositeMapShadowAction,
	MapActionTypes,
	MapFacadeService,
	StartMapShadowAction,
	StopMapShadowAction
} from '@ansyn/map-facade';
import { cloneDeep, isEmpty, isNil } from 'lodash';
import { ToolsActionsTypes } from '@ansyn/menu-items/tools';
import '@ansyn/core/utils/clone-deep';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/do';
import { DisplayOverlayAction } from '@ansyn/overlays';
import { IStatusBarState, statusBarToastMessages } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { StatusBarActionsTypes, statusBarFlagsItems, UpdateStatusFlagsAction } from '@ansyn/status-bar';
import {
	AddMapInstanceAction,
	AddOverlayToLoadingOverlaysAction,
	EnableMapGeoOptionsActionStore,
	PinPointTriggerAction,
	RemoveOverlayFromLoadingOverlaysAction,
	SetLayoutAction,
	SetOverlayNotInCaseAction,
	SynchronizeMapsAction
} from '@ansyn/map-facade/actions/map.actions';
import { CasesActionTypes, SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import {
	calcGeoJSONExtent,
	endTimingLog,
	getFootprintIntersectionRatioInExtent,
	getPointByPolygon,
	startTimingLog
} from '@ansyn/core/utils';
import { CenterMarkerPlugin } from '@ansyn/open-layer-center-marker-plugin';
import {
	AnnotationVisualizerAgentAction,
	SetActiveCenter,
	SetMapGeoEnabledModeToolsActionStore,
	SetPinLocationModeAction
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { IMapState } from '@ansyn/map-facade/reducers/map.reducer';
import { IToolsState } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { getPolygonByPoint } from '@ansyn/core/utils/geo';
import { CaseMapState, Position } from '@ansyn/core/models';
import {
	SetMapGeoEnabledModeStatusBarActionStore,
	SetToastMessageStoreAction
} from '@ansyn/status-bar/actions/status-bar.actions';
import { EnableOnlyFavoritesSelectionAction } from '@ansyn/menu-items/filters/actions/filters.actions';
import { IMapFacadeConfig } from '@ansyn/map-facade/models/map-config.model';
import { mapFacadeConfig } from '@ansyn/map-facade/models/map-facade.config';

@Injectable()
export class MapAppEffects {

	/**
	 * @type Effect
	 * @name onMapSingleClick$
	 * @ofType MapSingleClickAction
	 * @dependencies cases, status_bar
	 * @filter In pin point search
	 * @action UpdateStatusFlagsAction, PinPointTriggerAction
	 */
	@Effect()
	onMapSingleClick$: Observable<any> = this.actions$
		.ofType(MapActionTypes.MAP_SINGLE_CLICK)
		.withLatestFrom(this.store$.select('cases'), this.store$.select('status_bar'), (action: UpdateStatusFlagsAction, caseState: ICasesState, statusBarState: IStatusBarState) => [action, caseState, statusBarState])
		.filter(([action, caseState, statusBarState]: [UpdateStatusFlagsAction, ICasesState, IStatusBarState]): any => statusBarState.flags.get(statusBarFlagsItems.pinPointSearch))
		.mergeMap(([action]: [UpdateStatusFlagsAction, ICasesState, IStatusBarState]) => {
			// draw on all maps
			this.imageryCommunicatorService.communicatorsAsArray().forEach(communicator => {
				// this is for the others communicators
				communicator.removeSingleClickEvent();
			});

			return [
				// disable the pinpoint search
				new UpdateStatusFlagsAction({ key: statusBarFlagsItems.pinPointSearch, value: false }),
				// update pin point
				new PinPointTriggerAction(action.payload.lonLat)
			];
		});

	/**
	 * @type Effect
	 * @name onPinPointTrigger$
	 * @ofType PinPointTriggerAction
	 * @dependencies cases, status_bar
	 * @action UpdateCaseAction, LoadOverlaysAction
	 */
	@Effect()
	onPinPointTrigger$: Observable<any> = this.actions$
		.ofType(MapActionTypes.TRIGGER.PIN_POINT)
		.withLatestFrom(this.store$.select('cases'), this.store$.select('status_bar'), (action: UpdateStatusFlagsAction, caseState: ICasesState, statusBarState: IStatusBarState) => [action, caseState, statusBarState])
		.mergeMap(([action, caseState, statusBarState]: [PinPointTriggerAction, ICasesState, IStatusBarState]) => {

			// create the region
			const region = getPolygonByPoint(action.payload).geometry;

			// draw on all maps
			this.imageryCommunicatorService.communicatorsAsArray().forEach(communicator => {
				if (statusBarState.flags.get(statusBarFlagsItems.pinPointIndicator)) {
					communicator.addPinPointIndicator(action.payload);
				}
			});

			// draw the point on the map
			const selectedCase = {
				...caseState.selectedCase,
				state: { ...caseState.selectedCase.state, region: region }
			};

			return [
				// update case
				new UpdateCaseAction(selectedCase),
				// load overlays
				new LoadOverlaysAction({
					to: selectedCase.state.time.to,
					from: selectedCase.state.time.from,
					polygon: selectedCase.state.region,
					caseId: selectedCase.id
				})
			];
		});


	/**
	 * @type Effect
	 * @name onMapSingleClickPinLocation$
	 * @ofType MapSingleClickAction
	 * @dependencies tools
	 * @filter In pin location mode
	 * @action SetPinLocationModeAction, SetActiveCenter
	 */
	@Effect()
	onMapSingleClickPinLocation$: Observable<SetActiveCenter | SetPinLocationModeAction> = this.actions$
		.ofType(MapActionTypes.MAP_SINGLE_CLICK)
		.withLatestFrom(this.store$.select('tools'), (action, state: IToolsState): any => ({
			action,
			pin_location: state.flags.get('pin_location')
		}))
		.filter(({ action, pin_location }) => pin_location)
		.mergeMap(({ action }) => {
			return [
				new SetPinLocationModeAction(false),
				new SetActiveCenter(action.payload.lonLat)
			];
		});

	/**
	 * @type Effect
	 * @name onStartMapShadow$
	 * @ofType StartMouseShadow
	 * @action StartMapShadowAction
	 */
	@Effect()
	onStartMapShadow$: Observable<StartMapShadowAction> = this.actions$
		.ofType(ToolsActionsTypes.START_MOUSE_SHADOW)
		.map(() => new StartMapShadowAction());

	/**
	 * @type Effect
	 * @name onEndMapShadow$
	 * @ofType StopMouseShadow
	 * @action StopMapShadowAction
	 */
	@Effect()
	onEndMapShadow$: Observable<StopMapShadowAction> = this.actions$
		.ofType(ToolsActionsTypes.STOP_MOUSE_SHADOW)
		.map(() => new StopMapShadowAction());

	/**
	 * @type Effect
	 * @name onDisplayOverlay$
	 * @ofType DisplayOverlayAction
	 * @dependencies map
	 * @filter There is a full overlay
	 * @action DisplayOverlayFailedAction?, DisplayOverlaySuccessAction?
	 */
	@Effect()
	onDisplayOverlay$: Observable<DisplayOverlaySuccessAction> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY)
		.withLatestFrom(this.store$.select('map'), (action: DisplayOverlayAction, mapState: IMapState): any[] => {
			const overlay = action.payload.overlay;
			const map_id = action.payload.map_id ? action.payload.map_id : mapState.activeMapId;
			const map = MapFacadeService.mapById(mapState.mapsList, map_id);
			return [overlay, map_id, map.data.position];
		})
		.filter(([overlay]: [Overlay]) => !isEmpty(overlay) && overlay.isFullOverlay)
		.flatMap(([overlay, map_id, position]: [Overlay, string, Position]) => {
			const intersection = getFootprintIntersectionRatioInExtent(position.boundingBox, overlay.footprint);

			let extent;
			if (intersection > this.config.overlayCoverage) {
				extent = position.boundingBox;
			} else {
				extent = calcGeoJSONExtent(overlay.footprint);
			}

			const communicator = this.imageryCommunicatorService.provide(map_id);

			const mapType = communicator.ActiveMap.mapType;

			// assuming that there is one provider
			const sourceLoader = this.baseSourceProviders.find((item) => item.mapType === mapType && item.sourceType === overlay.sourceType);

			return Observable.fromPromise(sourceLoader.createAsync(overlay))
				.map(layer => {
					if (overlay.isGeoRegistered) {
						communicator.resetView(layer, extent);
					} else {
						if (communicator.activeMapName !== 'disabledOpenLayersMap') {
							communicator.setActiveMap('disabledOpenLayersMap', position, layer);
						} else {
							communicator.resetView(layer);
						}
					}
					return new DisplayOverlaySuccessAction({ id: overlay.id });
				})
				.catch(() => Observable.of(new DisplayOverlayFailedAction({ id: overlay.id })));
		});

	/**
	 * @type Effect
	 * @name displayOverlayOnNewMapInstance$
	 * @ofType AddMapInstanceAction, MapInstanceChangedAction
	 * @dependencies map
	 * @filter There is mapsList, and it has a an overlay with id from payload
	 * @action DisplayOverlayAction
	 */
	@Effect()
	displayOverlayOnNewMapInstance$: Observable<any> = this.actions$
		.ofType(MapActionTypes.ADD_MAP_INSTANCE, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
		.withLatestFrom(this.store$.select('map'))
		.filter(([action, mapsState]: [AddMapInstanceAction, IMapState]) => !isEmpty(mapsState.mapsList))
		.map(([action, mapsState]: [AddMapInstanceAction, IMapState]) => {
			return mapsState.mapsList
				.find((mapData) => mapData.data.overlay && mapData.id === action.payload.currentCommunicatorId);
		})
		.filter((caseMapState: CaseMapState) => !isNil(caseMapState))
		.map((caseMapState: CaseMapState) => {
			startTimingLog(`LOAD_OVERLAY_${caseMapState.data.overlay.id}`);
			return new DisplayOverlayAction({ overlay: caseMapState.data.overlay, map_id: caseMapState.id });
		});

	/**
	 * @type Effect
	 * @name displayOverlayFromCase$
	 * @ofType SelectCaseAction
	 * @dependencies map
	 */
	@Effect()
	displayOverlayFromCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.withLatestFrom(this.store$.select('map'))
		.mergeMap(([action, mapState]: [SelectCaseAction, IMapState]) => {
			return mapState.mapsList.reduce((previusResult, data: CaseMapState) => {
				const communicatorHandler = this.imageryCommunicatorService.provide(data.id);
				// if overlay exists and map is loaded
				if (data.data.overlay && communicatorHandler) {
					startTimingLog(`LOAD_OVERLAY_${data.data.overlay.id}`);
					previusResult.push(new DisplayOverlayAction({ overlay: data.data.overlay, map_id: data.id }));
				}
				return previusResult;
			}, []);
		});

	/**
	 * @type Effect
	 * @name displayOverlayFromCase$
	 * @ofType DisplayOverlayAction
	 * @action AddOverlayToLoadingOverlaysAction
	 */
	@Effect()
	setOverlayAsLoading$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY)
		.map((action: DisplayOverlayAction) =>
			new AddOverlayToLoadingOverlaysAction(action.payload.overlay.id));

	/**
	 * @type Effect
	 * @name onOverlayFromURL$
	 * @ofType DisplayOverlayAction
	 * @filter There is no full overlay
	 * @action RequestOverlayByIDFromBackendAction
	 */
	@Effect()
	onOverlayFromURL$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY)
		.filter((action: DisplayOverlayAction) => !action.payload.overlay.isFullOverlay)
		.map((action: DisplayOverlayAction) =>
			new RequestOverlayByIDFromBackendAction({
				overlayId: action.payload.overlay.id,
				map_id: action.payload.map_id
			}));

	/**
	 * @type Effect
	 * @name overlayLoadingSuccess$
	 * @ofType DisplayOverlaySuccessAction
	 * @action RemoveOverlayFromLoadingOverlaysAction
	 */
	@Effect()
	overlayLoadingSuccess$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS)
		.do((action: Action) => endTimingLog(`LOAD_OVERLAY_${action.payload.id}`))
		.map((action) => {
			return new RemoveOverlayFromLoadingOverlaysAction(action.payload.id);
		});

	/**
	 * @type Effect
	 * @name overlayLoadingFailed$
	 * @ofType DisplayOverlayFailedAction
	 * @action SetToastMessageStoreAction, RemoveOverlayFromLoadingOverlaysAction
	 */
	@Effect()
	overlayLoadingFailed$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY_FAILED)
		.do((action: Action) => endTimingLog(`LOAD_OVERLAY_FAILED${action.payload.id}`))
		.mergeMap((action) => [
			new SetToastMessageStoreAction({
				toastText: statusBarToastMessages.showOverlayErrorToast,
				showWarningIcon: true
			}),
			new RemoveOverlayFromLoadingOverlaysAction(action.payload.id)
		]);

	/**
	 * @type Effect
	 * @name addVectorLayer$
	 * @ofType SelectLayerAction
	 * @dependencies cases
	 */
	@Effect({ dispatch: false })
	addVectorLayer$: Observable<void> = this.actions$
		.ofType(LayersActionTypes.SELECT_LAYER)
		.withLatestFrom(this.store$.select('cases'))
		.map(([action, state]: [SelectLayerAction, ICasesState]) => {
			return [action, state.selectedCase.state.maps.active_map_id];
		})
		.map(([action, active_map_id]: [SelectLayerAction, string]) => {
			const imagery = this.imageryCommunicatorService.provide(active_map_id);
			imagery.addVectorLayer(action.payload);
		});

	/**
	 * @type Effect
	 * @name removeVectorLayer$
	 * @ofType UnselectLayerAction
	 * @dependencies cases
	 */
	@Effect({ dispatch: false })
	removeVectorLayer$: Observable<void> = this.actions$
		.ofType(LayersActionTypes.UNSELECT_LAYER)
		.withLatestFrom(this.store$.select('cases'))
		.map(([action, state]: [UnselectLayerAction, ICasesState]) => [action, state.selectedCase.state.maps.active_map_id])
		.map(([action, active_map_id]: [UnselectLayerAction, string]) => {
			let imagery = this.imageryCommunicatorService.provide(active_map_id);
			imagery.removeVectorLayer(action.payload);
		});

	/**
	 * @type Effect
	 * @name onCommunicatorChange$
	 * @ofType AddMapInstanceAction, RemoveMapInstanceAction, MapInstanceChangedAction
	 * @dependencies cases
	 * @filter There is at least one communicator, and exact length of maps
	 * @action CompositeMapShadowAction, AnnotationVisualizerAgentAction
	 */
	@Effect()
	onCommunicatorChange$: Observable<any> = this.actions$
		.ofType(MapActionTypes.ADD_MAP_INSTANCE, MapActionTypes.REMOVE_MAP_INSTACNE, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([action, caseState]: [Action, ICasesState]) => {
			const communicatorsIds = action.payload.communicatorsIds;
			return communicatorsIds.length > 1 && communicatorsIds.length === caseState.selectedCase.state.maps.data.length;
		})
		.mergeMap(() => [
			new CompositeMapShadowAction(),
			new AnnotationVisualizerAgentAction({
				maps: 'all',
				action: 'show',
			})
		]);

	/**
	 * @type Effect
	 * @name onAddCommunicatorShowPinPoint$
	 * @ofType AddMapInstanceAction, MapInstanceChangedAction
	 * @dependencies cases, status_bar
	 * @filter There is a pinPointIndicator or pinPointSearch
	 */
	@Effect({ dispatch: false })
	onAddCommunicatorShowPinPoint$: Observable<any> = this.actions$
		.ofType(MapActionTypes.ADD_MAP_INSTANCE, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
		.withLatestFrom(this.store$.select('cases'), this.store$.select('status_bar'))
		.filter(([action, caseState, statusBarState]: [any, any, any]) => statusBarState.flags.get(statusBarFlagsItems.pinPointIndicator) || statusBarState.flags.get(statusBarFlagsItems.pinPointSearch))
		.map(([action, caseState, statusBarState]: [any, any, any]) => {
			const communicatorHandler = this.imageryCommunicatorService.provide(action.payload.currentCommunicatorId);

			if (statusBarState.flags.get(statusBarFlagsItems.pinPointIndicator)) {
				const point = getPointByPolygon(caseState.selectedCase.state.region);
				communicatorHandler.addPinPointIndicator(point.coordinates);
			}

			if (statusBarState.flags.get(statusBarFlagsItems.pinPointSearch)) {
				communicatorHandler.createMapSingleClickEvent();
			}

		});

	/**
	 * @type Effect
	 * @name onAddCommunicatorInitPlugin$
	 * @ofType AddMapInstanceAction, MapInstanceChangedAction
	 */
	@Effect({ dispatch: false })
	onAddCommunicatorInitPlugin$: Observable<any> = this.actions$
		.ofType(MapActionTypes.ADD_MAP_INSTANCE, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
		.map((action: AddMapInstanceAction) => {
			// Init CenterMarkerPlugin
			const communicatorHandler = this.imageryCommunicatorService.provide(action.payload.currentCommunicatorId);
			const centerMarkerPluggin = communicatorHandler.getPlugin(CenterMarkerPlugin.s_pluginType);
			if (centerMarkerPluggin) {
				centerMarkerPluggin.init(communicatorHandler);
			}
		});

	/**
	 * @type Effect
	 * @name onSelectCaseByIdAddPinPointIndicator$
	 * @ofType SelectCaseAction
	 * @dependencies cases, status_bar
	 * @filter There is a pinPointIndicator or pinPointSearch
	 */
	@Effect({ dispatch: false })
	onSelectCaseByIdAddPinPointIndicator$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.withLatestFrom(this.store$.select('cases'), this.store$.select('status_bar'))
		.filter(([action, caseState, statusBarState]: [SelectCaseAction, ICasesState, IStatusBarState]) => statusBarState.flags.get(statusBarFlagsItems.pinPointIndicator))
		.do(([action, caseState, statusBarState]: [SelectCaseAction, ICasesState, IStatusBarState]) => {
			const point = getPointByPolygon(caseState.selectedCase.state.region);
			this.imageryCommunicatorService.communicatorsAsArray().forEach(communicator => {
				communicator.addPinPointIndicator(point.coordinates);
			});
		});

	/**
	 * @type Effect
	 * @name onSynchronizeAppMaps$
	 * @ofType SynchronizeMapsAction
	 * @dependencies cases
	 */
	@Effect({ dispatch: false })
	onSynchronizeAppMaps$: Observable<any> = this.actions$
		.ofType(MapActionTypes.SYNCHRONIZE_MAPS)
		.withLatestFrom(this.store$.select('cases'), (action: SynchronizeMapsAction, casesState: ICasesState) => [action, casesState])
		.map(([action, casesState]: [SynchronizeMapsAction, ICasesState]) => {
			const mapId = action.payload.mapId;
			const currentMapPosition = this.imageryCommunicatorService.provide(mapId).getPosition();
			casesState.selectedCase.state.maps.data.forEach((mapItem: CaseMapState) => {
				if (mapId !== mapItem.id) {
					const comm = this.imageryCommunicatorService.provide(mapItem.id);
					comm.setPosition(currentMapPosition);
				}
			});
		});

	/**
	 * @type Effect
	 * @name activeMapGeoRegistrationChanged$$
	 * @ofType DisplayOverlaySuccessAction, ActiveMapChangedAction
	 * @dependencies map
	 * @filter mapsList.length > 0
	 * @action EnableMapGeoOptionsActionStore
	 */
	@Effect()
	activeMapGeoRegistrationChanged$$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS, MapActionTypes.TRIGGER.ACTIVE_MAP_CHANGED)
		.withLatestFrom(this.store$.select('map'))
		.filter(([action, mapState]: [Action, IMapState]) => mapState.mapsList.length > 0)
		.map(([action, mapState]: [Action, IMapState]) => {
			let activeMapState;
			activeMapState = MapFacadeService.activeMap(mapState);
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
		.withLatestFrom(this.store$.select('map'))
		.map(([action, mapState]: [any, any]): any[] => {
			const mapId = action.payload.mapId ? action.payload.mapId : mapState.activeMapId;
			const map = MapFacadeService.mapById(mapState.mapsList, mapId);
			const mapComm = this.imageryCommunicatorService.provide(action.payload.mapId);
			return [mapComm, map.data.position];
		})
		.filter(([mapComm]) => !isNil(mapComm))
		.do(([mapComm, position]: any[]) => {
			mapComm.setActiveMap('openLayersMap', position);
		});

	/**
	 * @type Effect
	 * @name changeMapGeoOptionsMode$
	 * @ofType EnableMapGeoOptionsActionStore
	 * @action SetMapGeoEnabledModeToolsActionStore, SetMapGeoEnabledModeStatusBarActionStore
	 */
	@Effect()
	changeMapGeoOptionsMode$: Observable<any> = this.actions$
		.ofType(MapActionTypes.ENABLE_MAP_GEO_OPTIONS)
		.mergeMap((action: EnableMapGeoOptionsActionStore) => {
			const isGeoRegistered = action.payload.isEnabled;
			return [
				new SetMapGeoEnabledModeToolsActionStore(isGeoRegistered),
				new SetMapGeoEnabledModeStatusBarActionStore(isGeoRegistered)
			];
		});

	/**
	 * @type Effect
	 * @name onLayoutChange$
	 * @ofType ChangeLayoutAction
	 * @dependencies cases, status_bar
	 * @action UpdateCaseAction?, SetLayoutAction
	 */
	@Effect()
	onLayoutChange$: Observable<any> = this.actions$
		.ofType(StatusBarActionsTypes.CHANGE_LAYOUT)
		.withLatestFrom(this.store$.select('cases').pluck('selectedCase'), this.store$.select('status_bar'), ({ payload }, selectedCase: Case, statusbar: IStatusBarState) => {
			return [selectedCase, statusbar.layouts[payload], payload];
		})
		.mergeMap(([selectedCase, layout, layoutIndex]: any[]) => {
			const actions = [];
			if (selectedCase) {
				const updatedCase: Case = {
					...selectedCase,
					state: {
						...selectedCase.state,
						maps: {
							...selectedCase.state.maps,
							layouts_index: layoutIndex
						}
					}
				} as any;
				actions.push(new UpdateCaseAction(updatedCase));
			}
			actions.push(new SetLayoutAction(layout));
			return actions;
		});

	/**
	 * @type Effect
	 * @name setOverlaysNotInCase$
	 * @ofType SetFiltersAction, SetMapsDataActionStore
	 * @dependencies overlays, map
	 * @action SetOverlayNotInCaseAction
	 */
	@Effect()
	setOverlaysNotInCase$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.SET_FILTERS, MapActionTypes.STORE.SET_MAPS_DATA)
		.withLatestFrom(this.store$.select('overlays'), this.store$.select('map'), (action, { filteredOverlays }, mapState: IMapState) => {
			return [filteredOverlays, mapState.mapsList];
		})
		.map(([filteredOverlays, mapsList]: [any[], CaseMapState[]]) => {
			const overlaysNoInCase = new Map<string, boolean>();

			mapsList.forEach(({ data }) => {
				const { overlay } = data;
				if (overlay) {
					const notExistOnFilteredOverlay = !filteredOverlays.some(id => overlay.id === id);
					overlaysNoInCase.set(overlay.id, notExistOnFilteredOverlay);
				}
			});

			return new SetOverlayNotInCaseAction(overlaysNoInCase);
		});

	/**
	 * @type Effect
	 * @name markupOnMapsDataChanges$
	 * @ofType ActiveMapChangedAction, MapsListChangedAction
	 * @dependencies cases
	 * @action OverlaysMarkupAction
	 */
	@Effect()
	markupOnMapsDataChanges$ = this.actions$
		.ofType(MapActionTypes.TRIGGER.ACTIVE_MAP_CHANGED, MapActionTypes.TRIGGER.MAPS_LIST_CHANGED)
		.withLatestFrom(this.store$.select('cases').pluck('selectedCase'), (action, selectedCase) => selectedCase)
		.map((selectedCase: Case) => CasesService.getOverlaysMarkup(selectedCase))
		.map(markups => new OverlaysMarkupAction(markups));

	/**
	 * @type Effect
	 * @name onFavorite$
	 * @ofType SetFavoriteAction
	 * @dependencies cases
	 * @action UpdateCaseAction?, SyncFilteredOverlays, OverlaysMarkupAction, EnableOnlyFavoritesSelectionAction
	 */
	@Effect()
	onFavorite$: Observable<Action> = this.actions$
		.ofType(MapActionTypes.SET_FAVORITE)
		.withLatestFrom(this.store$.select('cases'), (action: Action, cases: ICasesState): [Action, Case] => [action, cloneDeep(cases.selectedCase)])
		.mergeMap(([action, selectedCase]: [Action, Case]) => {
			const actions = [];

			if (selectedCase.state.favoritesOverlays.includes(action.payload)) {
				selectedCase.state.favoritesOverlays = selectedCase.state.favoritesOverlays.filter(overlay => overlay !== action.payload);
			} else {
				selectedCase.state.favoritesOverlays.push(action.payload);
			}
			// if showOnlyFavorites filter active - sync filter with favorites change
			if (selectedCase.state.facets.showOnlyFavorites) {
				actions.push(new SyncFilteredOverlays());
			}

			const overlaysMarkup = CasesService.getOverlaysMarkup(selectedCase);

			// order does matter! update case must be the first action, since all other relies on it
			actions.unshift(new UpdateCaseAction(selectedCase));
			actions.push(new OverlaysMarkupAction(overlaysMarkup));
			actions.push(new EnableOnlyFavoritesSelectionAction(Boolean(selectedCase.state.favoritesOverlays.length)));

			return actions;
		});

	constructor(private actions$: Actions,
				private store$: Store<IAppState>,
				private imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(mapFacadeConfig) public config: IMapFacadeConfig,
				@Inject(BaseMapSourceProvider) private baseSourceProviders: BaseMapSourceProvider[]) {
	}
}
