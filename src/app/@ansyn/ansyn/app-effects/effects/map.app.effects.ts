import { Inject, Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs';
import {
	DisplayOverlayAction,
	DisplayOverlayFailedAction,
	DisplayOverlaySuccessAction,
	OverlaysActionTypes,
	RequestOverlayByIDFromBackendAction,
	SetMarkUp
} from '@ansyn/overlays/actions/overlays.actions';
import { statusBarToastMessages } from '@ansyn/status-bar/reducers/status-bar.reducer';
import {
	ImageryCreatedAction,
	MapActionTypes,
	SetIsLoadingAcion,
	SetMapsDataActionStore
} from '@ansyn/map-facade/actions/map.actions';
import {
	SetManualImageProcessing,
	SetMapGeoEnabledModeToolsActionStore,
	ToolsActionsTypes,
	UpdateOverlaysManualProcessArgs
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { IOverlaysState, MarkUpClass, overlaysStateSelector } from '@ansyn/overlays/reducers/overlays.reducer';
import { IMapFacadeConfig } from '@ansyn/map-facade/models/map-config.model';
import { mapFacadeConfig } from '@ansyn/map-facade/models/map-facade.config';
import {
	AddAlertMsg,
	BackToWorldView,
	CoreActionTypes,
	RemoveAlertMsg,
	SetToastMessageAction,
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
import { BaseMapSourceProvider } from '@ansyn/imagery/model/base-map-source-provider';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import { filter, map, mergeMap, pairwise, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { selectLayers, selectSelectedLayersIds } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { ILayer } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { IMAGERY_MAP_COMPONENTS, ImageryMapComponentConstructor } from '@ansyn/imagery/model/imagery-map-component';

@Injectable()
export class MapAppEffects {
	onDisplayOverlay$: Observable<any> = this.actions$
		.ofType<DisplayOverlayAction>(OverlaysActionTypes.DISPLAY_OVERLAY)
		.pipe(
			startWith(null),
			pairwise(),
			withLatestFrom(this.store$.select(mapStateSelector)),
			filter(this.onDisplayOverlayFilter.bind(this))
		);

	@Effect()
	onDisplayOverlaySwitchMap$ = this.onDisplayOverlay$
		.pipe(
			filter((data) => this.displayShouldSwitch(data)),
			switchMap(this.onDisplayOverlay.bind(this))
		);


	@Effect()
	onDisplayOverlayMergeMap$ = this.onDisplayOverlay$
		.pipe(
			filter((data) => !this.displayShouldSwitch(data)),
			mergeMap(this.onDisplayOverlay.bind(this))
		);

	@Effect()
	onDisplayOverlayShowLoader$ = this.onDisplayOverlay$
		.pipe(
			map(([[prevAction, action]]: [[DisplayOverlayAction, DisplayOverlayAction], IMapState]) => action),
			map(({ payload }: DisplayOverlayAction) => new SetIsLoadingAcion({
				mapId: payload.mapId, show: true, text: 'Loading Overlay'
			}))
		);

	@Effect()
	onDisplayOverlayHideLoader$ = this.actions$
		.ofType<DisplayOverlayAction>(
			OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS,
			OverlaysActionTypes.DISPLAY_OVERLAY_FAILED,
			CoreActionTypes.BACK_TO_WORLD_VIEW
		)
		.pipe(
			map(({ payload }: DisplayOverlayAction) => new SetIsLoadingAcion({
				mapId: payload.mapId, show: false
			}))
		);

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
		.pipe(
			withLatestFrom(this.store$.select(mapStateSelector)),
			map(([action, mapState]: [SetManualImageProcessing, IMapState]) => [MapFacadeService.activeMap(mapState), action, mapState]),
			filter(([activeMap]: [CaseMapState, SetManualImageProcessing, IMapState]) => Boolean(activeMap.data.overlay)),
			mergeMap(([activeMap, action, mapState]: [CaseMapState, SetManualImageProcessing, IMapState]) => {
				const updatedMapList = [...mapState.mapsList];
				activeMap.data.imageManualProcessArgs = action.payload;
				const overlayId = activeMap.data.overlay.id;
				return [
					new SetMapsDataActionStore({ mapsList: updatedMapList }),
					new UpdateOverlaysManualProcessArgs({ data: { [overlayId]: action.payload } })
				];
			}));

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
		.pipe(
			withLatestFrom(this.store$.select(mapStateSelector)),
			filter(([action, mapsState]: [ImageryCreatedAction, IMapState]) => Boolean(mapsState.mapsList) && mapsState.mapsList.length > 0),
			map(([action, mapsState]: [ImageryCreatedAction, IMapState]) => {
				return mapsState.mapsList
					.find((mapData) => mapData.data.overlay && mapData.id === action.payload.id);
			}),
			filter((caseMapState: CaseMapState) => Boolean(caseMapState)),
			map((caseMapState: CaseMapState) => {
				startTimingLog(`LOAD_OVERLAY_${caseMapState.data.overlay.id}`);
				return new DisplayOverlayAction({
					overlay: caseMapState.data.overlay,
					mapId: caseMapState.id,
					forceFirstDisplay: true
				});
			})
		);

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
		.pipe(
			filter((action: DisplayOverlayAction) => !OverlaysService.isFullOverlay(action.payload.overlay)),
			map((action: DisplayOverlayAction) => {
				return new RequestOverlayByIDFromBackendAction({
					overlayId: action.payload.overlay.id,
					sourceType: action.payload.overlay.sourceType,
					mapId: action.payload.mapId
				});
			})
		);


	/**
	 * @type Effect
	 * @name overlayLoadingFailed$
	 * @ofType DisplayOverlayFailedAction
	 * @action SetToastMessageAction, RemoveOverlayFromLoadingOverlaysAction
	 */
	@Effect()
	overlayLoadingFailed$: Observable<any> = this.actions$
		.ofType<DisplayOverlayFailedAction>(OverlaysActionTypes.DISPLAY_OVERLAY_FAILED)
		.pipe(
			tap((action) => endTimingLog(`LOAD_OVERLAY_FAILED${action.payload.id}`)),
			map((action) => new SetToastMessageAction({
				toastText: statusBarToastMessages.showOverlayErrorToast,
				showWarningIcon: true
			}))
		);


	/**
	 * @type Effect
	 * @name updateSelectedLayers$
	 * @ofType combineLatest(this.store$.select(selectLayers), this.store$.select(selectSelectedLayersIds)
	 */
	@Effect({ dispatch: false })
	updateSelectedLayers$: Observable<[ILayer[], string[]]> = combineLatest(this.store$.select(selectLayers), this.store$.select(selectSelectedLayersIds))
		.pipe(
			tap(([layers, selectedLayersIds]: [ILayer[], string[]]): void => {
				this.imageryMapComponents
					.filter(({ mapClass }: ImageryMapComponentConstructor) => mapClass.groupLayers.get('layers'))
					.forEach(({ mapClass }: ImageryMapComponentConstructor) => {
						const displayedLayers: any = mapClass.groupLayers.get('layers').getLayers().getArray();
						/* remove layer if layerId not includes on selectLayers */
						displayedLayers.forEach((layer) => {
							const id = layer.get('id');
							if (!selectedLayersIds.includes(id)) {
								mapClass.removeGroupLayer(id, 'layers');
							}
						});

						/* add layer if id includes on selectLayers but not on map */
						selectedLayersIds.forEach((layerId) => {
							const layer = displayedLayers.some((layer: any) => layer.get('id') === layerId);
							if (!layer) {
								const addLayer = layers.find(({ id }) => id === layerId);
								mapClass.addGroupVectorLayer(addLayer, 'layers');
							}
						});
					});
			})
		);

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
		.pipe(
			withLatestFrom(this.store$.select(overlaysStateSelector), this.store$.select(mapStateSelector)),
			mergeMap(([action, { filteredOverlays }, { mapsList }]: [Action, IOverlaysState, IMapState]) => {
				const key = AlertMsgTypes.overlayIsNotPartOfQuery;
				return mapsList.map(({ data, id }) => {
					const { overlay } = data;
					const shouldRemoved = !overlay || filteredOverlays.includes(overlay.id);
					return shouldRemoved ? new RemoveAlertMsg({ key, value: id }) : new AddAlertMsg({ key, value: id });
				});
			})
		);
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
		.pipe(
			withLatestFrom(this.store$.select(mapStateSelector)),
			filter(([action, mapState]: [Action, IMapState]) => Boolean(mapState && mapState.mapsList && mapState.mapsList.length)),
			map(([action, { mapsList, activeMapId }]: [Action, IMapState]) => {
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
			),
			mergeMap(({ actives, displayed }) => [
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
			)
		);

	/**
	 * @type Effect
	 * @name toggleLayersGroupLayer$
	 * @ofType ToggleMapLayersAction
	 */
	@Effect({ dispatch: false })
	toggleLayersGroupLayer$: Observable<any> = this.actions$
		.ofType<ToggleMapLayersAction>(CoreActionTypes.TOGGLE_MAP_LAYERS)
		.pipe(
			map(({ payload }) => this.imageryCommunicatorService.provide(payload.mapId)),
			tap((communicator: CommunicatorEntity) => {
				communicator.ActiveMap.toggleGroup('layers');
				communicator.visualizers.forEach(v => v.toggleVisibility());
			})
		);


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
		.pipe(
			withLatestFrom(this.store$.select(mapStateSelector)),
			map(([action, mapState]: [Action, IMapState]) => {
				const activeMapState = MapFacadeService.activeMap(mapState);
				const isGeoRegistered = MapFacadeService.isOverlayGeoRegistered(activeMapState.data.overlay);
				return new SetMapGeoEnabledModeToolsActionStore(isGeoRegistered);
			})
		);

	onDisplayOverlay([[prevAction, { payload }], mapState]: [[DisplayOverlayAction, DisplayOverlayAction], IMapState]) {
		const { overlay } = payload;
		const mapId = payload.mapId || mapState.activeMapId;
		const mapData = MapFacadeService.mapById(mapState.mapsList, payload.mapId || mapState.activeMapId).data;
		const prevOverlay = mapData.overlay;
		const intersection = getFootprintIntersectionRatioInExtent(mapData.position.extentPolygon, overlay.footprint);
		const communicator = this.imageryCommunicatorService.provide(mapId);


		const mapType = communicator.ActiveMap.mapType;
		const { sourceType } = overlay;
		const sourceLoader = communicator.getMapSourceProvider({ mapType, sourceType });

		if (!sourceLoader) {
			return Observable.of(new SetToastMessageAction({
				toastText: 'No source loader for ' + overlay.sourceType,
				showWarningIcon: true
			}));
		}

		const changeActiveMap = mergeMap((layer) => {
			let observable = Observable.of(true);
			const geoRegisteredMap = overlay.isGeoRegistered && communicator.activeMapName === DisabledOpenLayersMapName;
			const notGeoRegisteredMap = !overlay.isGeoRegistered && communicator.activeMapName === OpenlayersMapName;
			const newActiveMapName = geoRegisteredMap ? OpenlayersMapName : notGeoRegisteredMap ? DisabledOpenLayersMapName : '';

			if (newActiveMapName) {
				observable = Observable.fromPromise(communicator.setActiveMap(newActiveMapName, mapData.position, layer));
			}
			return observable.map(() => layer);
		});

		const extent = (intersection < this.config.overlayCoverage) && extentFromGeojson(overlay.footprint);
		const resetView = mergeMap((layer) => communicator.resetView(layer, mapData.position, extent));
		const displaySuccess = map(() => new DisplayOverlaySuccessAction(payload));

		return Observable.fromPromise(sourceLoader.createAsync(overlay))
			.pipe(changeActiveMap, resetView, displaySuccess)
			.catch(() => Observable.from([
				new DisplayOverlayFailedAction({ id: overlay.id, mapId }),
				prevOverlay ? new DisplayOverlayAction({ mapId, overlay: prevOverlay }) : new BackToWorldView({ mapId })
			]));
	}

	onDisplayOverlayFilter([[prevAction, { payload }], mapState]: [[DisplayOverlayAction, DisplayOverlayAction], IMapState]) {
		const isFull = OverlaysService.isFullOverlay(payload.overlay);
		const { overlay } = payload;
		const mapData = MapFacadeService.mapById(mapState.mapsList, payload.mapId || mapState.activeMapId).data;
		const isNotDisplayed = !(OverlaysService.isFullOverlay(mapData.overlay) && mapData.overlay.id === overlay.id);
		return isFull && (isNotDisplayed || payload.forceFirstDisplay);
	}

	displayShouldSwitch([[prevAction, action]]: [[DisplayOverlayAction, DisplayOverlayAction], IMapState]) {
		return (action && prevAction) && (prevAction.payload.mapId === action.payload.mapId);
	}

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(IMAGERY_MAP_COMPONENTS) protected imageryMapComponents: ImageryMapComponentConstructor[],
				@Inject(mapFacadeConfig) public config: IMapFacadeConfig,
				@Inject(BaseMapSourceProvider) protected baseSourceProviders: BaseMapSourceProvider[]) {
	}
}
