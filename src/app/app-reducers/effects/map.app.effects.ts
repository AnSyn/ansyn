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
	RequestOverlayByIDFromBackendAction
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
import { isEmpty, isNil } from 'lodash';
import { ToolsActionsTypes } from '@ansyn/menu-items/tools';
import '@ansyn/core/utils/clone-deep';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/do';
import { DisplayOverlayAction } from '@ansyn/overlays';
import { IStatusBarState, statusBarToastMessages } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { StatusBarActionsTypes, statusBarFlagsItems, UpdateStatusFlagsAction } from '@ansyn/status-bar';
import {
	AddMapInstacneAction,
	AddOverlayToLoadingOverlaysAction,
	EnableMapGeoOptionsActionStore,
	PinPointTriggerAction,
	RemoveOverlayFromLoadingOverlaysAction,
	SetLayoutAction,
	SetOverlayNotInCaseAction,
	SynchronizeMapsAction
} from '@ansyn/map-facade/actions/map.actions';
import { CasesActionTypes, SelectCaseByIdAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import {
	calcGeoJSONExtent,
	endTimingLog,
	getPointByPolygon,
	isExtentContainedInPolygon,
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

@Injectable()
export class MapAppEffects {

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
				...caseState.selected_case,
				state: { ...caseState.selected_case.state, region: region }
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

	@Effect()
	onStartMapShadow$: Observable<StartMapShadowAction> = this.actions$
		.ofType(ToolsActionsTypes.START_MOUSE_SHADOW)
		.map(() => new StartMapShadowAction());

	@Effect()
	onEndMapShadow$: Observable<StopMapShadowAction> = this.actions$
		.ofType(ToolsActionsTypes.STOP_MOUSE_SHADOW)
		.map(() => new StopMapShadowAction());

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

			const isInside = isExtentContainedInPolygon(position.boundingBox, overlay.footprint);

			let extent;
			if (isInside) {
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

	@Effect()
	displayOverlayOnNewMapInstance$: Observable<any> = this.actions$
		.ofType(MapActionTypes.ADD_MAP_INSTANCE, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
		.withLatestFrom(this.store$.select('map'))
		.filter(([action, mapsState]: [AddMapInstacneAction, IMapState]) => !isEmpty(mapsState.mapsList))
		.map(([action, mapsState]: [AddMapInstacneAction, IMapState]) => {
			return mapsState.mapsList
				.find((mapData) => mapData.data.overlay && mapData.id === action.payload.currentCommunicatorId);
		})
		.filter((caseMapState: CaseMapState) => !isNil(caseMapState))
		.map((caseMapState: CaseMapState) => {
			startTimingLog(`LOAD_OVERLAY_${caseMapState.data.overlay.id}`);
			return new DisplayOverlayAction({ overlay: caseMapState.data.overlay, map_id: caseMapState.id });
		});

	@Effect()
	displayOverlayFromCase$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.withLatestFrom(this.store$.select('map'))
		.mergeMap(([action, mapState]: [SelectCaseByIdAction, IMapState]) => {
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

	@Effect()
	setOverlayAsLoading$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY)
		.map((action: DisplayOverlayAction) =>
			new AddOverlayToLoadingOverlaysAction(action.payload.overlay.id));

	@Effect()
	onOverlayFromURL$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY)
		.filter((action: DisplayOverlayAction) => !action.payload.overlay.isFullOverlay)
		.map((action: DisplayOverlayAction) =>
			new RequestOverlayByIDFromBackendAction({
				overlayId: action.payload.overlay.id,
				map_id: action.payload.map_id
			}));

	@Effect()
	overlayLoadingSuccess$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS)
		.do((action: Action) => endTimingLog(`LOAD_OVERLAY_${action.payload.id}`))
		.map((action) => {
			return new RemoveOverlayFromLoadingOverlaysAction(action.payload.id);
		});

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

	@Effect({ dispatch: false })
	addVectorLayer$: Observable<void> = this.actions$
		.ofType(LayersActionTypes.SELECT_LAYER)
		.withLatestFrom(this.store$.select('cases'))
		.map(([action, state]: [SelectLayerAction, ICasesState]) => {
			return [action, state.selected_case.state.maps.active_map_id];
		})
		.map(([action, active_map_id]: [SelectLayerAction, string]) => {
			const imagery = this.imageryCommunicatorService.provide(active_map_id);
			imagery.addVectorLayer(action.payload);
		});

	@Effect({ dispatch: false })
	removeVectorLayer$: Observable<void> = this.actions$
		.ofType(LayersActionTypes.UNSELECT_LAYER)
		.withLatestFrom(this.store$.select('cases'))
		.map(([action, state]: [UnselectLayerAction, ICasesState]) => [action, state.selected_case.state.maps.active_map_id])
		.map(([action, active_map_id]: [UnselectLayerAction, string]) => {
			let imagery = this.imageryCommunicatorService.provide(active_map_id);
			imagery.removeVectorLayer(action.payload);
		});

	@Effect()
	onCommunicatorChange$: Observable<any> = this.actions$
		.ofType(MapActionTypes.ADD_MAP_INSTANCE, MapActionTypes.REMOVE_MAP_INSTACNE, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([action, caseState]: [Action, ICasesState]) => {
			const communicatorsIds = action.payload.communicatorsIds;
			return communicatorsIds.length > 1 && communicatorsIds.length === caseState.selected_case.state.maps.data.length;
		})
		.mergeMap(() => [
			new CompositeMapShadowAction(),
			new AnnotationVisualizerAgentAction({
				maps: 'all',
				action: 'show',
			})
		]);

	@Effect({ dispatch: false })
	onAddCommunicatorShowPinPoint$: Observable<any> = this.actions$
		.ofType(MapActionTypes.ADD_MAP_INSTANCE, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
		.withLatestFrom(this.store$.select('cases'), this.store$.select('status_bar'))
		.filter(([action, caseState, statusBarState]: [any, any, any]) => statusBarState.flags.get(statusBarFlagsItems.pinPointIndicator) || statusBarState.flags.get(statusBarFlagsItems.pinPointSearch))
		.map(([action, caseState, statusBarState]: [any, any, any]) => {
			const communicatorHandler = this.imageryCommunicatorService.provide(action.payload.currentCommunicatorId);

			if (statusBarState.flags.get(statusBarFlagsItems.pinPointIndicator)) {
				const point = getPointByPolygon(caseState.selected_case.state.region);
				communicatorHandler.addPinPointIndicator(point.coordinates);
			}

			if (statusBarState.flags.get(statusBarFlagsItems.pinPointSearch)) {
				communicatorHandler.createMapSingleClickEvent();
			}

		});

	@Effect({ dispatch: false })
	onAddCommunicatorInitPlugin$: Observable<any> = this.actions$
		.ofType(MapActionTypes.ADD_MAP_INSTANCE, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
		.map((action: AddMapInstacneAction) => {
			// Init CenterMarkerPlugin
			const communicatorHandler = this.imageryCommunicatorService.provide(action.payload.currentCommunicatorId);
			const centerMarkerPluggin = communicatorHandler.getPlugin(CenterMarkerPlugin.s_pluginType);
			if (centerMarkerPluggin) {
				centerMarkerPluggin.init(communicatorHandler);
			}
		});

	@Effect({ dispatch: false })
	onSelectCaseByIdAddPinPointIndicatore$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.withLatestFrom(this.store$.select('cases'), this.store$.select('status_bar'))
		.filter(([action, caseState, statusBarState]: [any, any, any]) => statusBarState.flags.get(statusBarFlagsItems.pinPointIndicator))
		.map(([action, caseState, statusBarState]: [any, any, any]) => {
			const point = getPointByPolygon(caseState.selected_case.state.region);
			this.imageryCommunicatorService.communicatorsAsArray().forEach(communicator => {
				communicator.addPinPointIndicator(point.coordinates);
			});
		});

	@Effect({ dispatch: false })
	onSynchronizeAppMaps$: Observable<any> = this.actions$
		.ofType(MapActionTypes.SYNCHRONIZE_MAPS)
		.withLatestFrom(this.store$.select('cases'), (action: SynchronizeMapsAction, casesState: ICasesState) => {
			return [action, casesState];
		})
		.map(([action, casesState]: [SynchronizeMapsAction, ICasesState]) => {
			const mapToSyncTo = casesState.selected_case.state.maps.data.find((map) => map.id === action.payload.mapId);
			casesState.selected_case.state.maps.data.forEach((mapItem: CaseMapState) => {
				if (mapToSyncTo.id !== mapItem.id) {
					const comm = this.imageryCommunicatorService.provide(mapItem.id);
					comm.setPosition(mapToSyncTo.data.position);
				}
			});
		});

	@Effect()
	activeMapGeoRegistartionChanged$: Observable<any> = this.actions$
		.ofType(
			OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS,
			MapActionTypes.TRIGGER.ACTIVE_MAP_CHANGED)
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

	@Effect({ dispatch: false })
	backToWorldGeoRegistartion$: Observable<any> = this.actions$
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

	@Effect()
	onLayoutChange$: Observable<any> = this.actions$
		.ofType(StatusBarActionsTypes.CHANGE_LAYOUT)
		.withLatestFrom(this.store$.select('cases').pluck('selected_case'), this.store$.select('status_bar'), ({ payload }, selectedCase: Case, statusbar: IStatusBarState) => {
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

	@Effect()
	markupOnMapsDataChanges$ = this.actions$
		.ofType(MapActionTypes.TRIGGER.ACTIVE_MAP_CHANGED, MapActionTypes.TRIGGER.MAPS_LIST_CHANGED)
		.withLatestFrom(this.store$.select('cases').pluck('selected_case'), (action, selected_case) => selected_case)
		.map((selectedCase: Case) => CasesService.getOverlaysMarkup(selectedCase))
		.map(markups => new OverlaysMarkupAction(markups));


	constructor(private actions$: Actions,
				private store$: Store<IAppState>,
				private imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(BaseMapSourceProvider) private baseSourceProviders: BaseMapSourceProvider[]) {
	}

}
