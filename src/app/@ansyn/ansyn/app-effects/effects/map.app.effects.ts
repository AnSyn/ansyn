import { Inject, Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable, ObservableInput } from 'rxjs/Observable';
import {
	DisplayOverlayAction,
	DisplayOverlayFailedAction,
	DisplayOverlaySuccessAction,
	OverlaysActionTypes,
	RequestOverlayByIDFromBackendAction, SetMarkUp
} from '@ansyn/overlays/actions/overlays.actions';
import {
	LayersActionTypes,
	SelectLayerAction,
	UnselectLayerAction
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import '@ansyn/core/utils/clone-deep';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/fromPromise';
import { statusBarToastMessages } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { ImageryCreatedAction, MapActionTypes, SetMapsDataActionStore } from '@ansyn/map-facade/actions/map.actions';
import {
	SetManualImageProcessing,
	SetMapGeoEnabledModeToolsActionStore,
	StartMouseShadow, ToolsActionsTypes, UpdateOverlaysManualProcessArgs
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { IToolsState, toolsFlags, toolsStateSelector } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { IOverlaysState, MarkUpClass, overlaysStateSelector } from '@ansyn/overlays/reducers/overlays.reducer';
import { IMapFacadeConfig } from '@ansyn/map-facade/models/map-config.model';
import { mapFacadeConfig } from '@ansyn/map-facade/models/map-facade.config';
import {
	AddAlertMsg, BackToWorldView,
	CoreActionTypes, RemoveAlertMsg, SetToastMessageAction,
	ToggleMapLayersAction
} from '@ansyn/core/actions/core.actions';
import { DisabledOpenLayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';
import { CaseMapState } from '@ansyn/core/models/case.model';
import { endTimingLog, startTimingLog } from '@ansyn/core/utils/logs/timer-logs';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { AlertMsgTypes } from '@ansyn/core/reducers/core.reducer';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { extentFromGeojson, getFootprintIntersectionRatioInExtent } from '@ansyn/core/utils/calc-extent';
import { IAppState } from '@ansyn/ansyn/app-effects/app.effects.module';
import { BaseMapSourceProvider } from '@ansyn/imagery/model/base-source-provider.model';
import { ImageryProviderService } from '@ansyn/imagery/provider-service/imagery-provider.service';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';

@Injectable()
export class MapAppEffects {

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
		.filter(this.onDisplayOverlayFilter.bind(this))
		.mergeMap(this.onDisplayOverlay.bind(this));

	/**
	 * @type Effect
	 * @name onSetManualImageProcessing$
	 * @ofType SetMapManualImageProcessing
	 * @dependencies map
	 * @filter There is a full overlay
	 * @action SetMapsDataAction
	 */
	@Effect()
	onSetManualImageProcessing$: Observable<any> = this.actions$
		.ofType<SetManualImageProcessing>(ToolsActionsTypes.SET_MANUAL_IMAGE_PROCESSING)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.map(([action, mapState]: [SetManualImageProcessing, IMapState]) => [MapFacadeService.activeMap(mapState), action, mapState])
		.filter(([activeMap]: [CaseMapState, SetManualImageProcessing, IMapState]) => Boolean(activeMap.data.overlay))
		.mergeMap(([activeMap, action, mapState]: [CaseMapState, SetManualImageProcessing, IMapState]) => {
			const updatedMapList = [ ...mapState.mapsList ];
			activeMap.data.imageManualProcessArgs = action.payload;
			const overlayId = activeMap.data.overlay.id;
			return [
				new SetMapsDataActionStore({ mapsList: updatedMapList }),
				new UpdateOverlaysManualProcessArgs({ [overlayId]: action.payload })
			];
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
				forceFirstDisplay: true
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
	 * @name setOverlaysNotInCase$
	 * @ofType SetFilteredOverlaysAction, SetMapsDataActionStore
	 * @dependencies overlays, map
	 * @action AddAlertMsg?, RemoveAlertMsg?
	 */
	@Effect()
	setOverlaysNotInCase$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.SET_FILTERED_OVERLAYS, MapActionTypes.STORE.SET_MAPS_DATA)
		.withLatestFrom(this.store$.select(overlaysStateSelector), this.store$.select(mapStateSelector))
		.mergeMap(([action, { filteredOverlays }, { mapsList }]: [Action, IOverlaysState, IMapState]) => {
			const key = AlertMsgTypes.OverlayIsNotPartOfCase;
			return mapsList.map(({ data, id }) => {
				const { overlay } = data;
				const shouldRemoved = !overlay || filteredOverlays.includes(overlay.id);
				return shouldRemoved ? new RemoveAlertMsg({ key, value: id }) : new AddAlertMsg({ key, value: id });
			});
		});
	/**
	 * @type Effect
	 * @name markupOnMapsDataChanges$
	 * @ofType ActiveMapChangedAction, MapsListChangedAction
	 * @dependencies none
	 * @action SetMarkUp
	 */
	@Effect()
	markupOnMapsDataChanges$ = this.actions$
		.ofType<Action>(MapActionTypes.TRIGGER.ACTIVE_MAP_CHANGED, MapActionTypes.TRIGGER.MAPS_LIST_CHANGED)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.filter(([action, mapState]: [Action, IMapState]) => Boolean(mapState && mapState.mapsList && mapState.mapsList.length))
		.map(([action, { mapsList, activeMapId }]: [Action, IMapState]) => {
				const actives = [];
				const displayed = [];
				mapsList.forEach((map: CaseMapState) => {
					if (Boolean(map.data.overlay)) {
						if (map.id === activeMapId) {
							actives.push(map.data.overlay.id);
						} else {
							displayed.push(map.data.overlay.id);
						}
					}
				});
				return {
					actives, displayed
				};
			}
		)
		.mergeMap(({ actives, displayed }) => [
				new SetMarkUp({
						classToSet: MarkUpClass.active,
						dataToSet: {
							overlaysIds: actives
						}
					}
				),
				new SetMarkUp({
					classToSet: MarkUpClass.displayed,
					dataToSet: {
						overlaysIds: displayed
					}
				})
			]
		);

	/**
	 * @type Effect
	 * @name toggleLayersGroupLayer$
	 * @ofType ToggleMapLayersAction
	 */
	@Effect({ dispatch: false })
	toggleLayersGroupLayer$: Observable<any> = this.actions$
		.ofType<ToggleMapLayersAction>(CoreActionTypes.TOGGLE_MAP_LAYERS)
		.map(({ payload }) => this.imageryCommunicatorService.provide(payload.mapId))
		.do((communicator: CommunicatorEntity) => {
			communicator.ActiveMap.toggleGroup('layers');
			communicator.visualizers.forEach(v => v.toggleVisibility());
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

	onDisplayOverlay([{ payload }, mapState]: [DisplayOverlayAction, IMapState]) {
		const { overlay } = payload;
		const mapId = payload.mapId || mapState.activeMapId;
		const mapData = MapFacadeService.mapById(mapState.mapsList, payload.mapId || mapState.activeMapId).data;
		const prevOverlay = mapData.overlay;
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

		return Observable.fromPromise(sourceLoader.createAsync(overlay))
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
				prevOverlay ? new DisplayOverlayAction({ mapId, overlay: prevOverlay }) : new BackToWorldView({ mapId })
			]));
	}

	onDisplayOverlayFilter([{ payload }, mapState]: [DisplayOverlayAction, IMapState]) {
		const isFull = OverlaysService.isFullOverlay(payload.overlay);
		const { overlay } = payload;
		const mapData = MapFacadeService.mapById(mapState.mapsList, payload.mapId || mapState.activeMapId).data;
		const isNotDisplayed = !(OverlaysService.isFullOverlay(mapData.overlay) && mapData.overlay.id === overlay.id);
		return isFull && (isNotDisplayed || payload.forceFirstDisplay);
	}

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				protected imageryProviderService: ImageryProviderService,
				@Inject(mapFacadeConfig) public config: IMapFacadeConfig,
				@Inject(BaseMapSourceProvider) protected baseSourceProviders: BaseMapSourceProvider[]) {
	}
}
