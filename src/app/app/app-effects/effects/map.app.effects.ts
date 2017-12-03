import { Inject, Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Observable, ObservableInput } from 'rxjs/Observable';
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
import { MapActionTypes, MapFacadeService } from '@ansyn/map-facade';
import { cloneDeep, isEmpty, isNil } from 'lodash';
import '@ansyn/core/utils/clone-deep';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/fromPromise';
import { DisplayOverlayAction } from '@ansyn/overlays';
import {
	IStatusBarState,
	statusBarStateSelector,
	statusBarToastMessages
} from '@ansyn/status-bar/reducers/status-bar.reducer';
import { StatusBarActionsTypes, statusBarFlagsItems, UpdateStatusFlagsAction } from '@ansyn/status-bar';
import {
	AddMapInstanceAction,
	AddOverlayToLoadingOverlaysAction,
	DrawPinPointAction,
	EnableMapGeoOptionsActionStore,
	MapSingleClickAction,
	PinPointTriggerAction,
	RemoveOverlayFromLoadingOverlaysAction,
	SetLayoutAction,
	SetMapsDataActionStore,
	SetOverlaysNotInCaseAction,
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
	SetPinLocationModeAction,
	StartMouseShadow
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { IToolsState, toolsStateSelector } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { CaseMapState, Position } from '@ansyn/core/models';
import {
	ChangeLayoutAction,
	SetMapGeoEnabledModeStatusBarActionStore
} from '@ansyn/status-bar/actions/status-bar.actions';
import { EnableOnlyFavoritesSelectionAction } from '@ansyn/menu-items/filters/actions/filters.actions';
import { casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { overlaysStateSelector } from '@ansyn/overlays/reducers/overlays.reducer';
import { IMapFacadeConfig } from '@ansyn/map-facade/models/map-config.model';
import { mapFacadeConfig } from '@ansyn/map-facade/models/map-facade.config';
import { getPolygonByPointAndRadius } from '@ansyn/core/utils/geo';

import { ILayerState, layersStateSelector } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { CoreActionTypes, SetToastMessageAction, ToggleFavoriteAction } from '@ansyn/core/actions/core.actions';


@Injectable()
export class MapAppEffects {

	/**
	 * @type Effect
	 * @name onMapSingleClick$
	 * @ofType MapSingleClickAction
	 * @dependencies cases, statusBar
	 * @filter In pin point search
	 * @action UpdateStatusFlagsAction, PinPointTriggerAction
	 */
	@Effect()
	onMapSingleClick$: Observable<any> = this.actions$
		.ofType(MapActionTypes.MAP_SINGLE_CLICK)
		.withLatestFrom(this.store$.select(casesStateSelector), this.store$.select(statusBarStateSelector), (action: MapSingleClickAction, caseState: ICasesState, statusBarState: IStatusBarState) => [action, caseState, statusBarState])
		.filter(([action, caseState, statusBarState]: [MapSingleClickAction, ICasesState, IStatusBarState]): any => statusBarState.flags.get(statusBarFlagsItems.pinPointSearch))
		.mergeMap(([action]: [MapSingleClickAction, ICasesState, IStatusBarState]) => {
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
	 * @dependencies cases, statusBar
	 * @action UpdateCaseAction, LoadOverlaysAction, DrawPinPointAction
	 * @description
	 * draw pin point, update case and load overlays.
	 * draw pin point is done by DrawPinPointAction
	 */
	@Effect()
	onPinPointTrigger$: Observable<any> = this.actions$
		.ofType(MapActionTypes.TRIGGER.PIN_POINT)
		.withLatestFrom(this.store$.select(casesStateSelector), this.store$.select(statusBarStateSelector), (action: PinPointTriggerAction, caseState: ICasesState, statusBarState: IStatusBarState) => [action, caseState, statusBarState])
		.mergeMap(([action, caseState, statusBarState]: [PinPointTriggerAction, ICasesState, IStatusBarState]) => {
			// create the region
			const region = getPolygonByPointAndRadius(action.payload).geometry;

			// draw the point on the map
			const selectedCase = {
				...caseState.selectedCase,
				state: { ...caseState.selectedCase.state, region }
			};

			return [
				new DrawPinPointAction(action.payload),
				new UpdateCaseAction(selectedCase),
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
		.withLatestFrom(this.store$.select(toolsStateSelector), (action, state: IToolsState): any => ({
			action,
			pinLocation: state.flags.get('pinLocation')
		}))
		.filter(({ action, pinLocation }) => pinLocation)
		.mergeMap(({ action }) => {
			return [
				new SetPinLocationModeAction(false),
				new SetActiveCenter(action.payload.lonLat)
			];
		});

	/**
	 * @type Effect
	 * @name onDisplayOverlay$
	 * @ofType DisplayOverlayAction
	 * @dependencies map
	 * @filter There is a full overlay
	 * @action DisplayOverlayFailedAction?, DisplayOverlaySuccessAction?, SetToastMessageAction?
	 */
	@Effect()
	onDisplayOverlay$: ObservableInput<any> = this.actions$
		.ofType<DisplayOverlayAction>(OverlaysActionTypes.DISPLAY_OVERLAY)
		.withLatestFrom(this.store$.select(mapStateSelector), (action: DisplayOverlayAction, mapState: IMapState): [Overlay, string, Position] => {
			const overlay = action.payload.overlay;
			const mapId = action.payload.mapId ? action.payload.mapId : mapState.activeMapId;
			const map = MapFacadeService.mapById(mapState.mapsList, mapId);
			return [overlay, mapId, map.data.position];
		})
		.filter(([overlay]: [Overlay, string, Position]) => !isEmpty(overlay) && overlay.isFullOverlay)
		.mergeMap<[Overlay, string, Position], any>(([overlay, mapId, position]: [Overlay, string, Position]) => {
			const intersection = getFootprintIntersectionRatioInExtent(position.boundingBox, overlay.footprint);

			const communicator = this.imageryCommunicatorService.provide(mapId);

			const mapType = communicator.ActiveMap.mapType;

			// assuming that there is one provider
			const sourceLoader = this.baseSourceProviders.find((item) => item.mapType === mapType && item.sourceType === overlay.sourceType);

			if (!sourceLoader) {
				return Observable.of(new SetToastMessageAction({
					toastText: 'No source loader for ' + mapType + '/' + overlay.sourceType,
					showWarningIcon: true
				}));
			}

			return Observable.fromPromise(sourceLoader.createAsync(overlay, mapId))
				.map(layer => {
					if (overlay.isGeoRegistered) {
						if (intersection < this.config.overlayCoverage) {
							communicator.resetView(layer, calcGeoJSONExtent(overlay.footprint));
						} else {
							communicator.resetView(layer);
						}
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
		.withLatestFrom(this.store$.select(mapStateSelector))
		.filter(([action, mapsState]: [AddMapInstanceAction, IMapState]) => !isEmpty(mapsState.mapsList))
		.map(([action, mapsState]: [AddMapInstanceAction, IMapState]) => {
			return mapsState.mapsList
				.find((mapData) => mapData.data.overlay && mapData.id === action.payload.currentCommunicatorId);
		})
		.filter((caseMapState: CaseMapState) => !isNil(caseMapState))
		.map((caseMapState: CaseMapState) => {
			startTimingLog(`LOAD_OVERLAY_${caseMapState.data.overlay.id}`);
			return new DisplayOverlayAction({ overlay: caseMapState.data.overlay, mapId: caseMapState.id });
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
		.withLatestFrom(this.store$.select(mapStateSelector))
		.mergeMap(([action, mapState]: [SelectCaseAction, IMapState]) => {
			return mapState.mapsList.reduce((previousResult, data: CaseMapState) => {
				const communicatorHandler = this.imageryCommunicatorService.provide(data.id);
				// if overlay exists and map is loaded
				if (data.data.overlay && communicatorHandler) {
					startTimingLog(`LOAD_OVERLAY_${data.data.overlay.id}`);
					previousResult.push(new DisplayOverlayAction({ overlay: data.data.overlay, mapId: data.id }));
				}
				return previousResult;
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
		.ofType<DisplayOverlayAction>(OverlaysActionTypes.DISPLAY_OVERLAY)
		.filter((action: DisplayOverlayAction) => !action.payload.overlay.isFullOverlay)
		.map((action: DisplayOverlayAction) =>
			new RequestOverlayByIDFromBackendAction({
				overlayId: action.payload.overlay.id,
				sourceType: action.payload.overlay.sourceType,
				mapId: action.payload.mapId
			}));

	/**
	 * @type Effect
	 * @name overlayLoadingSuccess$
	 * @ofType DisplayOverlaySuccessAction
	 * @action RemoveOverlayFromLoadingOverlaysAction
	 */
	@Effect()
	overlayLoadingSuccess$: Observable<any> = this.actions$
		.ofType<DisplayOverlaySuccessAction>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS)
		.do((action) => endTimingLog(`LOAD_OVERLAY_${action.payload.id}`))
		.map((action) => {
			return new RemoveOverlayFromLoadingOverlaysAction(action.payload.id);
		});

	/**
	 * @type Effect
	 * @name overlayLoadingFailed$
	 * @ofType DisplayOverlayFailedAction
	 * @action SetToastMessageAction, RemoveOverlayFromLoadingOverlaysAction
	 */
	@Effect()
	overlayLoadingFailed$: Observable<any> = this.actions$
		.ofType<DisplayOverlayFailedAction>(OverlaysActionTypes.DISPLAY_OVERLAY_FAILED)
		.do((action) => endTimingLog(`LOAD_OVERLAY_FAILED${action.payload.id}`))
		.mergeMap((action) => [
			new SetToastMessageAction({
				toastText: statusBarToastMessages.showOverlayErrorToast,
				showWarningIcon: true
			}),
			new RemoveOverlayFromLoadingOverlaysAction(action.payload.id)
		]);

	/**
	 * @type Effect
	 * @name addVectorLayer$
	 * @ofType SelectLayerAction
	 * @dependencies map
	 */
	@Effect({ dispatch: false })
	addVectorLayer$: Observable<SelectLayerAction> = this.actions$
		.ofType<SelectLayerAction>(LayersActionTypes.SELECT_LAYER)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.map(([action, mapState]: [SelectLayerAction, IMapState]) => {
			const imagery = this.imageryCommunicatorService.provide(mapState.activeMapId);
			imagery.addVectorLayer(action.payload);
			return action;
		});

	/**
	 * @type Effect
	 * @name removeVectorLayer$
	 * @ofType UnselectLayerAction
	 * @dependencies map
	 */
	@Effect({ dispatch: false })
	removeVectorLayer$: Observable<UnselectLayerAction> = this.actions$
		.ofType(LayersActionTypes.UNSELECT_LAYER)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.map(([action, mapState]: [UnselectLayerAction, IMapState]) => {
			let imagery = this.imageryCommunicatorService.provide(mapState.activeMapId);
			imagery.removeVectorLayer(action.payload);
			return action;
		});

	/**
	 * @type Effect
	 * @name onCommunicatorChange$
	 * @ofType AddMapInstanceAction, RemoveMapInstanceAction, MapInstanceChangedAction
	 * @dependencies cases, map, layers
	 * @filter There is at least one communicator, and exact length of maps
	 * @action AnnotationVisualizerAgentAction?
	 */
	@Effect()
	onCommunicatorChange$: Observable<any> = this.actions$
		.ofType<any>(MapActionTypes.ADD_MAP_INSTANCE, MapActionTypes.REMOVE_MAP_INSTACNE, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
		.withLatestFrom<any, IMapState, ILayerState>(this.store$.select(mapStateSelector), this.store$.select(layersStateSelector))
		.filter(([action, mapState, layerState]: [any, IMapState, ILayerState]) => {
			const communicatorsIds = action.payload.communicatorsIds;
			return layerState.displayAnnotationsLayer &&
				communicatorsIds.length > 1 && communicatorsIds.length === mapState.mapsList.length;
		})
		.map(() => {
			return new AnnotationVisualizerAgentAction({
				maps: 'all',
				action: 'show'
			});
		});

	/**
	 * @type Effect
	 * @name onAddCommunicatorDoPinpointSearch
	 * @ofType AddMapInstanceAction, MapInstanceChangedAction
	 * @dependencies cases, statusBar
	 * @filter pinPointSearch flag on
	 */
	@Effect({ dispatch: false })
	onAddCommunicatorDoPinpointSearch$: Observable<any> = this.actions$
		.ofType(MapActionTypes.ADD_MAP_INSTANCE, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
		.withLatestFrom(this.store$.select(statusBarStateSelector))
		.filter(([action, statusBarState]: [any, IStatusBarState]) => statusBarState.flags.get(statusBarFlagsItems.pinPointSearch))
		.do(([action]: [any]) => {
			const communicatorHandler = this.imageryCommunicatorService.provide(action.payload.currentCommunicatorId);
			communicatorHandler.createMapSingleClickEvent();
		});

	/**
	 * @type Effect
	 * @name onAddCommunicatorShowPinPointIndicator$
	 * @ofType AddMapInstanceAction, MapInstanceChangedAction
	 * @dependencies cases, statusBar
	 * @filter pinPointIndicator flag on
	 * @actions DrawPinPointAction
	 */
	@Effect()
	onAddCommunicatorShowPinPointIndicator$: Observable<any> = this.actions$
		.ofType(MapActionTypes.ADD_MAP_INSTANCE, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
		.withLatestFrom(this.store$.select(casesStateSelector), this.store$.select(statusBarStateSelector))
		.filter(([action, casesState, statusBarState]: [any, ICasesState, IStatusBarState]) =>
			statusBarState.flags.get(statusBarFlagsItems.pinPointIndicator))
		.map(([action, casesState]: [any, ICasesState]) => {
			const point = getPointByPolygon(casesState.selectedCase.state.region);
			return new DrawPinPointAction(point.coordinates);
		});

	/**
	 * @type Effect
	 * @name onAddCommunicatorShowShadowMouse$
	 * @ofType AddMapInstanceAction, MapInstanceChangedAction, SetMapsDataActionStore
	 * @dependencies cases, statusBar
	 * @filter shadowMouse flag on
	 * @actions StartMouseShadow
	 */
	@Effect()
	onAddCommunicatorShowShadowMouse$: Observable<any> = this.actions$
		.ofType(MapActionTypes.ADD_MAP_INSTANCE, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION, MapActionTypes.STORE.SET_MAPS_DATA)
		.withLatestFrom(this.store$.select(toolsStateSelector))
		.filter(([action, toolsState]: [any, IToolsState]) => toolsState.flags.get('shadowMouse'))
		.map(() => new StartMouseShadow());


	/**
	 * @type Effect
	 * @name onAddCommunicatorInitPlugin$
	 * @ofType AddMapInstanceAction, MapInstanceChangedAction
	 */
	@Effect({ dispatch: false })
	onAddCommunicatorInitPlugin$: Observable<any> = this.actions$
		.ofType(MapActionTypes.ADD_MAP_INSTANCE, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
		.do((action: AddMapInstanceAction) => {
			// Init CenterMarkerPlugin
			const communicatorHandler = this.imageryCommunicatorService.provide(action.payload.currentCommunicatorId);
			const centerMarkerPlugin = communicatorHandler.getPlugin(CenterMarkerPlugin.sPluginType);
			if (centerMarkerPlugin) {
				centerMarkerPlugin.init(communicatorHandler);
			}
		});

	/**
	 * @type Effect
	 * @name onSelectCaseByIdAddPinPointIndicator$
	 * @ofType SelectCaseAction
	 * @dependencies cases, statusBar
	 * @filter There is a pinPointIndicator or pinPointSearch
	 * @actions DrawPinPointAction
	 */
	@Effect()
	onSelectCaseByIdAddPinPointIndicator$: Observable<DrawPinPointAction> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.withLatestFrom(this.store$.select(casesStateSelector), this.store$.select(statusBarStateSelector))
		.filter(([action, caseState, statusBarState]: [SelectCaseAction, ICasesState, IStatusBarState]) => statusBarState.flags.get(statusBarFlagsItems.pinPointIndicator))
		.map(([action, caseState]: [SelectCaseAction, ICasesState, IStatusBarState]) => {
			const point = getPointByPolygon(caseState.selectedCase.state.region);
			return new DrawPinPointAction(point.coordinates);
		});

	/**
	 * @type Effect
	 * @name onSynchronizeAppMaps$
	 * @ofType SynchronizeMapsAction
	 * @dependencies cases
	 */
	@Effect({ dispatch: false })
	onSynchronizeAppMaps$: Observable<SynchronizeMapsAction> = this.actions$
		.ofType(MapActionTypes.SYNCHRONIZE_MAPS)
		.withLatestFrom(this.store$.select(casesStateSelector), (action: SynchronizeMapsAction, casesState: ICasesState) => [action, casesState])
		.map(([action, casesState]: [SynchronizeMapsAction, ICasesState]) => {
			const mapId = action.payload.mapId;
			const currentMapPosition = this.imageryCommunicatorService.provide(mapId).getPosition();
			casesState.selectedCase.state.maps.data.forEach((mapItem: CaseMapState) => {
				if (mapId !== mapItem.id) {
					const comm = this.imageryCommunicatorService.provide(mapItem.id);
					comm.setPosition(currentMapPosition);
				}
			});
			return action;
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
	 * @dependencies cases, statusBar
	 * @action UpdateCaseAction?, SetLayoutAction
	 */
	@Effect()
	onLayoutChange$: Observable<any> = this.actions$
		.ofType<ChangeLayoutAction>(StatusBarActionsTypes.CHANGE_LAYOUT)
		.withLatestFrom(this.store$.select(casesStateSelector).pluck('selectedCase'), this.store$.select(statusBarStateSelector), ({ payload }, selectedCase: Case, statusbar: IStatusBarState) => {
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
							layoutsIndex: layoutIndex
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
		.withLatestFrom(this.store$.select(overlaysStateSelector), this.store$.select(mapStateSelector), (action, { filteredOverlays }, mapState: IMapState) => {
			return [filteredOverlays, mapState.mapsList];
		})
		.map(([filteredOverlays, mapsList]: [string[], CaseMapState[]]) => {
			const overlaysNoInCase = new Map<string, boolean>();

			mapsList.forEach(({ data }) => {
				const { overlay } = data;
				if (overlay) {
					const notExistOnFilteredOverlay = !filteredOverlays.some(id => overlay.id === id);
					overlaysNoInCase.set(overlay.id, notExistOnFilteredOverlay);
				}
			});

			return new SetOverlaysNotInCaseAction(overlaysNoInCase);
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
		.ofType<Action>(MapActionTypes.TRIGGER.ACTIVE_MAP_CHANGED, MapActionTypes.TRIGGER.MAPS_LIST_CHANGED)
		.withLatestFrom(this.store$.select(casesStateSelector).pluck('selectedCase'), (action, selectedCase) => selectedCase)
		.map((selectedCase: Case) => CasesService.getOverlaysMarkup(selectedCase))
		.map(markups => new OverlaysMarkupAction(markups));

	/**
	 * @type Effect
	 * @name onFavorite$
	 * @ofType ToggleFavoriteAction
	 * @dependencies cases
	 * @action UpdateCaseAction?, SyncFilteredOverlays, OverlaysMarkupAction, EnableOnlyFavoritesSelectionAction
	 */
	@Effect()
	onFavorite$: Observable<Action> = this.actions$
		.ofType<ToggleFavoriteAction>(CoreActionTypes.TOGGLE_OVERLAY_FAVORITE)
		.withLatestFrom(this.store$.select(casesStateSelector), (action: ToggleFavoriteAction, cases: ICasesState): [Action, Case] => [action, cloneDeep(cases.selectedCase)])
		.mergeMap(([action, selectedCase]: [ToggleFavoriteAction, Case]) => {
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

	/**
	 * @type Effect
	 * @name onMapsDataChange$
	 * @ofType SetMapsDataActionStore
	 * @dependencies cases, map
	 * @action UpdateCaseAction
	 */
	@Effect()
	onMapsDataChange$: Observable<UpdateCaseAction> = this.actions$
		.ofType(MapActionTypes.STORE.SET_MAPS_DATA)
		.map(toPayload)
		.withLatestFrom(this.store$.select(casesStateSelector).pluck('selectedCase'), this.store$.select(mapStateSelector))
		.map(([action, selectedCase, mapState]: [any, Case, IMapState]) => {
			const updatedCase = {
				...selectedCase,
				state: {
					...selectedCase.state,
					maps: {
						...selectedCase.state.maps,
						data: [...mapState.mapsList],
						activeMapId: mapState.activeMapId
					}
				}
			} as Case;
			return new UpdateCaseAction(updatedCase);
		});

	/**
	 * @type Effect
	 * @name selectCaseByIdUpdateMapsData$
	 * @ofType SelectCaseAction
	 * @action SetMapsDataActionStore
	 */
	@Effect()
	selectCaseByIdUpdateMapsData$: Observable<SetMapsDataActionStore> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.map(({ payload }: SelectCaseAction) => cloneDeep(payload.state.maps))
		.map(({ activeMapId, data }) => {
			return new SetMapsDataActionStore({ mapsList: data, activeMapId: activeMapId });
		});


	constructor(protected actions$: Actions,
				private store$: Store<IAppState>,
				private imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(mapFacadeConfig) public config: IMapFacadeConfig,
				@Inject(BaseMapSourceProvider) private baseSourceProviders: BaseMapSourceProvider[]) {
	}
}
