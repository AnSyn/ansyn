import { Inject, Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import {
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
import { IStatusBarState } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { statusBarFlagsItems, UpdateStatusFlagsAction, StatusBarActionsTypes } from '@ansyn/status-bar';
import {
	AddMapInstacneAction,
	AddOverlayToLoadingOverlaysAction,
	EnableMapGeoOptionsActionStore,
	RemoveOverlayFromLoadingOverlaysAction,
	SetLayoutAction,
	SetOverlayNotInCaseAction,
	SynchronizeMapsAction
} from '@ansyn/map-facade/actions/map.actions';
import { CasesActionTypes, SelectCaseByIdAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { calcGeoJSONExtent, isExtentContainedInPolygon, getPointByPolygon } from '@ansyn/core/utils';
import { IOverlayState } from '@ansyn/overlays/reducers/overlays.reducer';
import { CenterMarkerPlugin } from '@ansyn/open-layer-center-marker-plugin';
import {
	AnnotationVisualizerAgentAction
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { IMapState } from '@ansyn/map-facade/reducers/map.reducer';
import { endTimingLog, startTimingLog } from '@ansyn/core/utils';
import { SetActiveCenter, SetPinLocationModeAction } from '@ansyn/menu-items/tools/actions/tools.actions';
import { IToolsState } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { getPolygonByPoint } from '@ansyn/core/utils/geo';
import { Position, CaseMapState, MapsLayout } from '@ansyn/core/models';
import { SetMapGeoEnabledModeToolsActionStore } from '../../packages/menu-items/tools/actions/tools.actions';
import { SetMapGeoEnabledModeStatusBarActionStore } from '../../packages/status-bar/actions/status-bar.actions';

@Injectable()
export class MapAppEffects {

	@Effect()
	onMapSingleClick$: Observable<any> = this.actions$
		.ofType(MapActionTypes.MAP_SINGLE_CLICK)
		.withLatestFrom(this.store$.select('cases'), this.store$.select('status_bar'), (action: UpdateStatusFlagsAction, caseState: ICasesState, statusBarState: IStatusBarState) => [action, caseState, statusBarState])
		.filter(([action, caseState, statusBarState]: [UpdateStatusFlagsAction, ICasesState, IStatusBarState]): any => statusBarState.flags.get(statusBarFlagsItems.pinPointSearch))
		.mergeMap(([action, caseState, statusBarState]: [UpdateStatusFlagsAction, ICasesState, IStatusBarState]) => {

			// create the region
			const region = getPolygonByPoint(action.payload.lonLat).geometry;

			// draw on all maps
			this.communicator.communicatorsAsArray().forEach(communicator => {
				if (statusBarState.flags.get(statusBarFlagsItems.pinPointIndicator)) {
					communicator.addPinPointIndicator(action.payload.lonLat);
				}
				// this is for the others communicators
				communicator.removeSingleClickEvent();
			});

			// draw the point on the map // all maps
			const selectedCase = {
				...caseState.selected_case,
				state: { ...caseState.selected_case.state, region: region }
			};

			return [
				// disable the pinpoint search
				new UpdateStatusFlagsAction({ key: statusBarFlagsItems.pinPointSearch, value: false }),
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
		.withLatestFrom(this.store$.select('overlays'), this.store$.select('cases'), (action: DisplayOverlayAction, overlaysState: IOverlayState, casesState: ICasesState): any[] => {
			const overlay = action.payload.overlay;
			const map_id = action.payload.map_id ? action.payload.map_id : casesState.selected_case.state.maps.active_map_id;
			const map = CasesService.mapById(casesState.selected_case, map_id);
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

			const communicator = this.communicator.provide(map_id);

			const mapType = communicator.ActiveMap.mapType;

			// assuming that there is one provider
			const sourceLoader = this.baseSourceProviders.find((item) => item.mapType === mapType && item.sourceType === overlay.sourceType);

			return Observable.fromPromise(sourceLoader.createAsync(overlay)).map(layer => {
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
			});
		});

	@Effect()
	displayOverlayOnNewMapInstance$: Observable<any> = this.actions$
		.ofType(MapActionTypes.ADD_MAP_INSTANCE, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
		.withLatestFrom(this.store$.select('cases'))
		.filter(([action, state]: [AddMapInstacneAction, ICasesState]) => !isNil(state.selected_case))
		.map(([action, state]: [AddMapInstacneAction, ICasesState]) => {
			const currentCase = state.selected_case;
			return currentCase.state.maps.data
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
		.withLatestFrom(this.store$.select('cases'))
		.mergeMap(([action, state]: [SelectCaseByIdAction, ICasesState]) => {
			const currentCase = state.selected_case;
			return currentCase.state.maps.data.reduce((previusResult, data: CaseMapState) => {
				const communicatorHandler = this.communicator.provide(data.id);
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
		.map((action)=> {
			return new RemoveOverlayFromLoadingOverlaysAction(action.payload.id)
		});

	@Effect({ dispatch: false })
	addVectorLayer$: Observable<void> = this.actions$
		.ofType(LayersActionTypes.SELECT_LAYER)
		.withLatestFrom(this.store$.select('cases'))
		.map(([action, state]: [SelectLayerAction, ICasesState]) => {
			return [action, state.selected_case.state.maps.active_map_id];
		})
		.map(([action, active_map_id]: [SelectLayerAction, string]) => {
			const imagery = this.communicator.provide(active_map_id);
			imagery.addVectorLayer(action.payload);
		});

	@Effect({ dispatch: false })
	removeVectorLayer$: Observable<void> = this.actions$
		.ofType(LayersActionTypes.UNSELECT_LAYER)
		.withLatestFrom(this.store$.select('cases'))
		.map(([action, state]: [UnselectLayerAction, ICasesState]) => [action, state.selected_case.state.maps.active_map_id])
		.map(([action, active_map_id]: [UnselectLayerAction, string]) => {
			let imagery = this.communicator.provide(active_map_id);
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
			const communicatorHandler = this.communicator.provide(action.payload.currentCommunicatorId);

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
			const communicatorHandler = this.communicator.provide(action.payload.currentCommunicatorId);
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
			this.communicator.communicatorsAsArray().forEach(c => {
				c.addPinPointIndicator(point.coordinates);
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
					const comm = this.communicator.provide(mapItem.id);
					comm.setPosition(mapToSyncTo.data.position);
				}
			});
		});

	@Effect()
	activeMapGeoRegistartionChanged$: Observable<any> = this.actions$
		.ofType(
			OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS,
			MapActionTypes.BACK_TO_WORLD,
			MapActionTypes.ACTIVE_MAP_CHANGED,
			MapActionTypes.STORE.SET_MAPS_DATA)
		.withLatestFrom(this.store$.select('cases'), this.store$.select('map'))
		.filter(([action, casesState, mapState]: [Action, ICasesState, IMapState]) => mapState.mapsList.length > 0)
		.map(([action, casesState, mapState]: [Action, ICasesState, IMapState]) => {
			let activeMapState;
			if (action.type === MapActionTypes.BACK_TO_WORLD) {
				const mapId = action.payload.mapId ? action.payload.mapId : casesState.selected_case.state.maps.active_map_id;
				activeMapState = MapFacadeService.mapById(mapState.mapsList, mapId);
			} else {
				activeMapState = MapFacadeService.activeMap(mapState);
			}
			const isGeoRegistered = MapFacadeService.isOverlayGeoRegistered(activeMapState.data.overlay);
			return [action, isGeoRegistered, activeMapState, mapState];
		})
		.filter(([action, isGeoRegistered, activeMapState, mapState]: [Action, boolean, CaseMapState, IMapState]): any => {
			const isEnabled = mapState.mapIdToGeoOptions.get(activeMapState.id);
			return isEnabled !== isGeoRegistered;
		})
		.map(([action, isGeoRegistered, activeMapState, mapState]: [Action, boolean, CaseMapState, IMapState]): any => {
			if (action.type === MapActionTypes.BACK_TO_WORLD) {
				const mapComm = this.communicator.provide(activeMapState.id);
				mapComm.setActiveMap('openLayersMap', activeMapState.data.position);
			}
			return new EnableMapGeoOptionsActionStore({ mapId: activeMapState.id, isEnabled: isGeoRegistered });
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
		.withLatestFrom(this.store$.select('status_bar'), ({ payload }, statusbar: IStatusBarState) => statusbar.layouts[payload])
		.map((layout: MapsLayout) => {
			return new SetLayoutAction(layout);
		});

	@Effect()
	setOverlaysNotInCase$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.SET_FILTERS, MapActionTypes.BACK_TO_WORLD)
		.withLatestFrom(this.store$.select('overlays'), this.store$.select('cases').pluck('selected_case'), (action, { filteredOverlays }, { state }) => {
			return [filteredOverlays, state.maps.data];
		})
		.map(([filteredOverlays, mapsData]: [any[], CaseMapState[]]) => {
			const overlaysNoInCase = new Map<string, boolean>();

			mapsData.forEach(({ data }) => {
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
		.ofType(MapActionTypes.ACTIVE_MAP_CHANGED, MapActionTypes.MAPS_LIST_CHANGED)
		.withLatestFrom(this.store$.select('cases').pluck('selected_case'), (action, selected_case) => selected_case)
		.map((selectedCase:Case) => CasesService.getOverlaysMarkup(selectedCase))
		.map(markups => new OverlaysMarkupAction(markups));

	constructor(private actions$: Actions,
				private store$: Store<IAppState>,
				private communicator: ImageryCommunicatorService,
				@Inject(BaseMapSourceProvider) private baseSourceProviders: BaseMapSourceProvider[]) {
	}

}
