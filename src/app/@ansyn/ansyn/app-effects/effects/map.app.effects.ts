import { Inject, Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable, ObservableInput } from 'rxjs/Observable';
import {
	DisplayOverlayFailedAction,
	DisplayOverlaySuccessAction,
	OverlaysActionTypes,
	OverlaysMarkupAction,
	RequestOverlayByIDFromBackendAction
} from '@ansyn/overlays/actions/overlays.actions';
import { BaseMapSourceProvider, ImageryCommunicatorService, ImageryProviderService } from '@ansyn/imagery';
import {
	LayersActionTypes,
	SelectLayerAction,
	UnselectLayerAction
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { IAppState } from '../';
import { Case, ICasesState } from '@ansyn/menu-items/cases';
import { MapActionTypes, MapFacadeService } from '@ansyn/map-facade';
import '@ansyn/core/utils/clone-deep';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/fromPromise';
import { DisplayOverlayAction, IOverlaysState, OverlaysService } from '@ansyn/overlays';
import {
	IStatusBarState,
	statusBarStateSelector,
	statusBarToastMessages
} from '@ansyn/status-bar/reducers/status-bar.reducer';
import { statusBarFlagsItems, UpdateStatusFlagsAction } from '@ansyn/status-bar';
import {
	ImageryCreatedAction,
	DrawPinPointAction,
	MapSingleClickAction,
	PinPointTriggerAction
} from '@ansyn/map-facade/actions/map.actions';
import {
	endTimingLog,
	extentFromGeojson,
	getFootprintIntersectionRatioInExtent,
	getPointByGeometry,
	startTimingLog
} from '@ansyn/core/utils';
import {
	SetActiveCenter,
	SetMapGeoEnabledModeToolsActionStore,
	SetPinLocationModeAction,
	StartMouseShadow
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { IToolsState, toolsStateSelector } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { CaseMapState } from '@ansyn/core/models';
import { casesStateSelector } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { overlaysStateSelector } from '@ansyn/overlays/reducers/overlays.reducer';
import { IMapFacadeConfig } from '@ansyn/map-facade/models/map-config.model';
import { mapFacadeConfig } from '@ansyn/map-facade/models/map-facade.config';
import { getPolygonByPointAndRadius } from '@ansyn/core/utils/geo';
import { CoreActionTypes, SetToastMessageAction, ToggleMapLayersAction } from '@ansyn/core/actions/core.actions';
import { CoreService } from '@ansyn/core/services/core.service';
import {
	AlertMsgTypes, BackToWorldView, coreStateSelector, ICoreState, SetOverlaysCriteriaAction,
	UpdateAlertMsg
} from '@ansyn/core';
import { DisabledOpenLayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map';

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
	 * @action UpdateCaseAction, LoadOverlaysAction, DrawPinPointAction
	 * @description
	 * draw pin point, update case and load overlays.
	 * draw pin point is done by DrawPinPointAction
	 */
	@Effect()
	onPinPointTrigger$: Observable<any> = this.actions$
		.ofType(MapActionTypes.TRIGGER.PIN_POINT)
		.mergeMap((action: PinPointTriggerAction) => {
			const region = getPolygonByPointAndRadius(action.payload).geometry;
			return [
				new DrawPinPointAction(action.payload),
				new SetOverlaysCriteriaAction({ region })
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
		.withLatestFrom(this.store$.select(mapStateSelector))
		.filter(([{ payload }]: [DisplayOverlayAction, IMapState]) => OverlaysService.isFullOverlay(payload.overlay))
		.mergeMap(([{ payload }, mapState]: [DisplayOverlayAction, IMapState]) => {
			const { overlay } = payload;
			const mapId = payload.mapId || mapState.activeMapId;
			const mapData = MapFacadeService.mapById(mapState.mapsList, payload.mapId || mapState.activeMapId).data;
			const intersection = getFootprintIntersectionRatioInExtent(mapData.position.extentPolygon, overlay.footprint);
			const communicator = this.imageryCommunicatorService.provide(mapId);
			const mapType = communicator.ActiveMap.mapType;
			const sourceLoader = this.baseSourceProviders.find((item) => item.mapType === mapType && item.sourceType === overlay.sourceType);

			if (!sourceLoader) {
				return Observable.of(new SetToastMessageAction({
					toastText: 'No source loader for ' + mapType + '/' + overlay.sourceType,
					showWarningIcon: true
				}));
			}

			return Observable.fromPromise(sourceLoader.createAsync(overlay, mapId))
				.switchMap(layer => {
					let observable;
					if (overlay.isGeoRegistered) {
						if (communicator.activeMapName === DisabledOpenLayersMapName) {
							observable = Observable.fromPromise(communicator.setActiveMap(OpenlayersMapName, mapData.position, layer));
						}
						if (intersection < this.config.overlayCoverage) {
							observable = communicator.resetView(layer, mapData.position, extentFromGeojson(overlay.footprint));
						} else {
							observable = communicator.resetView(layer, mapData.position);
						}
					} else {
						if (communicator.activeMapName !== DisabledOpenLayersMapName) {
							observable = Observable.fromPromise(communicator.setActiveMap(DisabledOpenLayersMapName, mapData.position, layer));
						} else {
							observable = communicator.resetView(layer, mapData.position);
						}
					}
					return observable.map(() => new DisplayOverlaySuccessAction(payload));
				})
				.catch(() => Observable.from([
					new DisplayOverlayFailedAction({ id: overlay.id, mapId }),
					new BackToWorldView({ mapId })
				]));
		});

	/**
	 * @type Effect
	 * @name displayOverlayOnNewMapInstance$
	 * @ofType MapInstanceChangedAction
	 * @dependencies map
	 * @filter There is mapsList, and it has a an overlay with id from payload
	 * @action DisplayOverlayAction
	 */
	@Effect()
	displayOverlayOnNewMapInstance$: Observable<any> = this.actions$
		.ofType(MapActionTypes.IMAGERY_CREATED)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.filter(([action, mapsState]: [ImageryCreatedAction, IMapState]) => Boolean(mapsState.mapsList) && mapsState.mapsList.length > 0)
		.map(([action, mapsState]: [ImageryCreatedAction, IMapState]) => {
			return mapsState.mapsList
				.find((mapData) => mapData.data.overlay && mapData.id === action.payload.id);
		})
		.filter((caseMapState: CaseMapState) => Boolean(caseMapState))
		.map((caseMapState: CaseMapState) => {
			startTimingLog(`LOAD_OVERLAY_${caseMapState.data.overlay.id}`);
			return new DisplayOverlayAction({
				overlay: caseMapState.data.overlay,
				mapId: caseMapState.id,
				ignoreRotation: true
			});
		});

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
		.filter((action: DisplayOverlayAction) => !OverlaysService.isFullOverlay(action.payload.overlay))
		.map((action: DisplayOverlayAction) => {
			return new RequestOverlayByIDFromBackendAction({
				overlayId: action.payload.overlay.id,
				sourceType: action.payload.overlay.sourceType,
				mapId: action.payload.mapId
			});
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
		.map((action) => new SetToastMessageAction({
			toastText: statusBarToastMessages.showOverlayErrorToast,
			showWarningIcon: true
		}));

	/**
	 * @type Effect
	 * @name addGroupLayer$
	 * @ofType SelectLayerAction
	 */
	@Effect({ dispatch: false })
	addGroupLayer$: Observable<SelectLayerAction> = this.actions$
		.ofType<SelectLayerAction>(LayersActionTypes.SELECT_LAYER)
		.map((action: SelectLayerAction) => {
			const providers = this.imageryProviderService.mapProviders;
			Object.keys(providers).forEach(pName => {
				const provider = providers[pName];
				provider.mapComponent.mapClass.addGroupVectorLayer(action.payload, 'layers');
			});

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
		.map((action: UnselectLayerAction) => {
			const providers = this.imageryProviderService.mapProviders;
			Object.keys(providers).forEach(pName => {
				const provider = providers[pName];
				provider.mapComponent.mapClass.removeGroupLayer(action.payload, 'layers');
			});

			return action;
		});

	/**
	 * @type Effect
	 * @name onAddCommunicatorDoPinpointSearch
	 * @ofType MapInstanceChangedAction
	 * @dependencies cases, statusBar
	 * @filter pinPointSearch flag on
	 */
	@Effect({ dispatch: false })
	onAddCommunicatorDoPinpointSearch$: Observable<any> = this.actions$
		.ofType(MapActionTypes.IMAGERY_CREATED, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
		.withLatestFrom(this.store$.select(statusBarStateSelector))
		.filter(([action, statusBarState]: [any, IStatusBarState]) => statusBarState.flags.get(statusBarFlagsItems.pinPointSearch))
		.do(([action]: [any]) => {
			const communicatorHandler = this.imageryCommunicatorService.provide(action.payload.id);
			communicatorHandler.createMapSingleClickEvent();
		});

	/**
	 * @type Effect
	 * @name onAddCommunicatorShowPinPointIndicator$
	 * @ofType MapInstanceChangedAction
	 * @dependencies cases, statusBar
	 * @filter pinPointIndicator flag on
	 * @actions DrawPinPointAction
	 */
	@Effect()
	onAddCommunicatorShowPinPointIndicator$: Observable<any> = this.actions$
		.ofType(MapActionTypes.IMAGERY_PLUGINS_INITIALIZED)
		.withLatestFrom(this.store$.select(casesStateSelector), this.store$.select(statusBarStateSelector))
		.filter(([action, casesState, statusBarState]: [any, ICasesState, IStatusBarState]) =>
			statusBarState.flags.get(statusBarFlagsItems.pinPointIndicator))
		.map(([action, casesState]: [any, ICasesState]) => {
			const point = getPointByGeometry(casesState.selectedCase.state.region);
			return new DrawPinPointAction(point.coordinates);
		});

	/**
	 * @type Effect
	 * @name onAddCommunicatorShowShadowMouse$
	 * @ofType MapInstanceChangedAction, SetMapsDataActionStore
	 * @dependencies cases, statusBar
	 * @filter shadowMouse flag on
	 * @actions StartMouseShadow
	 */
	@Effect()
	onAddCommunicatorShowShadowMouse$: Observable<any> = this.actions$
		.ofType(MapActionTypes.IMAGERY_CREATED, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION, MapActionTypes.STORE.SET_MAPS_DATA)
		.withLatestFrom(this.store$.select(toolsStateSelector))
		.filter(([action, toolsState]: [any, IToolsState]) => toolsState.flags.get('shadowMouse'))
		.map(() => new StartMouseShadow());

	/**
	 * @type Effect
	 * @name setOverlaysNotInCase$
	 * @ofType SetFilteredOverlaysAction, SetMapsDataActionStore
	 * @dependencies overlays, map
	 * @action UpdateAlertMsg
	 */
	@Effect()
	setOverlaysNotInCase$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.SET_FILTERED_OVERLAYS, MapActionTypes.STORE.SET_MAPS_DATA)
		.withLatestFrom(this.store$.select(overlaysStateSelector), this.store$.select(mapStateSelector), this.store$.select(coreStateSelector))
		.map(([action, { filteredOverlays }, { mapsList }, { alertMsg }]: [Action, IOverlaysState, IMapState, ICoreState]) => {
			const overlayIsNotPartOfCase = new Set(alertMsg.get(AlertMsgTypes.OverlayIsNotPartOfCase));

			mapsList.forEach(({ data, id }) => {
				const { overlay } = data;
				if (overlay) {
					filteredOverlays.includes(overlay.id) ? overlayIsNotPartOfCase.delete(id) : overlayIsNotPartOfCase.add(id);
				} else {
					overlayIsNotPartOfCase.delete(id);
				}
			});
			return new UpdateAlertMsg({ value: overlayIsNotPartOfCase, key: AlertMsgTypes.OverlayIsNotPartOfCase });
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
		.withLatestFrom(this.store$, (action, state): IAppState => state)
		.map(({ map, core }: IAppState) => CoreService.getOverlaysMarkup(map.mapsList, map.activeMapId, core.favoriteOverlays))
		.map(markups => new OverlaysMarkupAction(markups));

	/**
	 * @type Effect
	 * @name toggleLayersGroupLayer$
	 * @ofType ToggleMapLayersAction
	 */
	@Effect({ dispatch: false })
	toggleLayersGroupLayer$: Observable<any> = this.actions$
		.ofType<ToggleMapLayersAction>(CoreActionTypes.TOGGLE_MAP_LAYERS)
		.do(({ payload }) => {
			const mapId = payload.mapId;

			let communicator;
			if (!mapId) {
				communicator = this.imageryCommunicatorService.communicatorsAsArray()[0];
			} else {
				communicator = this.imageryCommunicatorService.provide(mapId);
			}

			communicator.ActiveMap.toggleGroup('layers');

			communicator.getAllVisualizers().forEach(v => v.toggleVisibility());
		});


	/**
	 * @type Effect
	 * @name activeMapGeoRegistrationChanged$
	 * @ofType DisplayOverlaySuccessAction, ActiveMapChangedAction
	 * @dependencies map
	 * @filter mapsList.length > 0
	 * @action SetMapGeoEnabledModeToolsActionStore
	 */
	@Effect()
	activeMapGeoRegistrationChanged$: Observable<any> = this.actions$
		.ofType(MapActionTypes.TRIGGER.MAPS_LIST_CHANGED, MapActionTypes.TRIGGER.ACTIVE_MAP_CHANGED)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.map(([action, mapState]: [Action, IMapState]) => {
			const activeMapState = MapFacadeService.activeMap(mapState);
			const isGeoRegistered = MapFacadeService.isOverlayGeoRegistered(activeMapState.data.overlay);
			return new SetMapGeoEnabledModeToolsActionStore(isGeoRegistered);
		});

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				protected imageryProviderService: ImageryProviderService,
				@Inject(mapFacadeConfig) public config: IMapFacadeConfig,
				@Inject(BaseMapSourceProvider) protected baseSourceProviders: BaseMapSourceProvider[]) {
	}
}
