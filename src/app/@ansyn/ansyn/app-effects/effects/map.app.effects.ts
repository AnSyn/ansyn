import { Inject, Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { EMPTY, Observable, of, pipe } from 'rxjs';
import {
	DisplayOverlayAction,
	DisplayOverlayFailedAction,
	DisplayOverlaySuccessAction,
	OverlaysActionTypes,
	RequestOverlayByIDFromBackendAction,
	SetMarkUp
} from '@ansyn/overlays/actions/overlays.actions';
import { ImageryCreatedAction, MapActionTypes, SetIsLoadingAcion } from '@ansyn/map-facade/actions/map.actions';
import {
	SetManualImageProcessing,
	SetMapGeoEnabledModeToolsActionStore,
	ToolsActionsTypes,
	UpdateOverlaysManualProcessArgs
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { IOverlaysState, MarkUpClass, overlaysStateSelector } from '@ansyn/overlays/reducers/overlays.reducer';
import { mapFacadeConfig, IMapFacadeConfig } from '@ansyn/map-facade';
import {
	AddAlertMsg,
	BackToWorldView,
	CoreActionTypes,
	RemoveAlertMsg,
	SetMapsDataActionStore,
	SetToastMessageAction,
	ToggleMapLayersAction
} from '@ansyn/core/actions/core.actions';
import { DisabledOpenLayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';
import { ICaseMapState } from '@ansyn/core/models/case.model';
import { endTimingLog, startTimingLog } from '@ansyn/core/utils/logs/timer-logs';
import { AlertMsgTypes } from '@ansyn/core/reducers/core.reducer';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { extentFromGeojson, getFootprintIntersectionRatioInExtent } from '@ansyn/core/utils/calc-extent';
import { BaseMapSourceProvider } from '@ansyn/imagery/model/base-map-source-provider';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import { catchError, debounceTime, filter, map, mergeMap, pairwise, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { IMAGERY_MAPS, IBaseImageryMapConstructor } from '@ansyn/imagery';
import { toastMessages } from '@ansyn/core/models/toast-messages';
import { IAppState } from '../app.effects.module';
import { isFullOverlay } from '@ansyn/core/utils/overlays';

@Injectable()
export class MapAppEffects {
	onDisplayOverlay$: Observable<any> = this.actions$
		.pipe(
			ofType<DisplayOverlayAction>(OverlaysActionTypes.DISPLAY_OVERLAY),
			startWith(null),
			pairwise(),
			withLatestFrom(this.store$.select(mapStateSelector)),
			filter(this.onDisplayOverlayFilter.bind(this))
		);


	onDisplayOverlaySwitchMap$ = this.onDisplayOverlay$
		.pipe(
			filter((data) => this.displayShouldSwitch(data))
		);

	@Effect()
	onDisplayOverlaySwitchMapWithAbort$ = this.onDisplayOverlaySwitchMap$
		.pipe(
			filter((data) => this.shouldAbortDisplay(data)),
			switchMap(this.onDisplayOverlay.bind(this))
		);

	@Effect()
	onDisplayOverlaySwitchMapWithDebounce$ = this.onDisplayOverlaySwitchMap$
		.pipe(
			debounceTime(this.config.displayDebounceTime),
			filter(this.onDisplayOverlayFilter.bind(this)),
			switchMap(this.onDisplayOverlay.bind(this))
		);

	@Effect()
	onDisplayOverlayMergeMap$ = this.onDisplayOverlay$
		.pipe(
			filter((data) => !this.displayShouldSwitch(data)),
			mergeMap(this.onDisplayOverlay.bind(this))
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

	@Effect()
	onSetManualImageProcessing$: Observable<any> = this.actions$
		.ofType<SetManualImageProcessing>(ToolsActionsTypes.SET_MANUAL_IMAGE_PROCESSING)
		.pipe(
			withLatestFrom(this.store$.select(mapStateSelector)),
			map(([action, mapState]: [SetManualImageProcessing, IMapState]) => [MapFacadeService.activeMap(mapState), action, mapState]),
			filter(([activeMap]: [ICaseMapState, SetManualImageProcessing, IMapState]) => Boolean(activeMap.data.overlay)),
			mergeMap(([activeMap, action, mapState]: [ICaseMapState, SetManualImageProcessing, IMapState]) => {
				const updatedMapList = [...mapState.mapsList];
				activeMap.data.imageManualProcessArgs = action.payload;
				const overlayId = activeMap.data.overlay.id;
				return [
					new SetMapsDataActionStore({ mapsList: updatedMapList }),
					new UpdateOverlaysManualProcessArgs({ data: { [overlayId]: action.payload } })
				];
			}));

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
			filter((caseMapState: ICaseMapState) => Boolean(caseMapState)),
			map((caseMapState: ICaseMapState) => {
				startTimingLog(`LOAD_OVERLAY_${caseMapState.data.overlay.id}`);
				return new DisplayOverlayAction({
					overlay: caseMapState.data.overlay,
					mapId: caseMapState.id,
					forceFirstDisplay: true
				});
			})
		);

	@Effect()
	onOverlayFromURL$: Observable<any> = this.actions$
		.ofType<DisplayOverlayAction>(OverlaysActionTypes.DISPLAY_OVERLAY)
		.pipe(
			filter((action: DisplayOverlayAction) => !isFullOverlay(action.payload.overlay)),
			mergeMap((action: DisplayOverlayAction) => {
				return [
					new RequestOverlayByIDFromBackendAction({
						overlayId: action.payload.overlay.id,
						sourceType: action.payload.overlay.sourceType,
						mapId: action.payload.mapId
					}),
					new SetIsLoadingAcion({ mapId: action.payload.mapId, show: true, text: 'Loading Overlay' })
				];
			})
		);

	@Effect()
	overlayLoadingFailed$: Observable<any> = this.actions$
		.ofType<DisplayOverlayFailedAction>(OverlaysActionTypes.DISPLAY_OVERLAY_FAILED)
		.pipe(
			tap((action) => endTimingLog(`LOAD_OVERLAY_FAILED${action.payload.id}`)),
			map((action) => new SetToastMessageAction({
				toastText: toastMessages.showOverlayErrorToast,
				showWarningIcon: true
			}))
		);

	@Effect()
	setOverlaysNotInCase$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.SET_FILTERED_OVERLAYS, CoreActionTypes.SET_MAPS_DATA)
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

	@Effect()
	markupOnMapsDataChanges$ = this.actions$
		.ofType<Action>(MapActionTypes.TRIGGER.ACTIVE_MAP_CHANGED, MapActionTypes.TRIGGER.MAPS_LIST_CHANGED)
		.pipe(
			withLatestFrom(this.store$.select(mapStateSelector)),
			filter(([action, mapState]: [Action, IMapState]) => Boolean(mapState && mapState.mapsList && mapState.mapsList.length)),
			map(([action, { mapsList, activeMapId }]: [Action, IMapState]) => {
					const actives = [];
					const displayed = [];
					mapsList.forEach((map: ICaseMapState) => {
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

	@Effect({ dispatch: false })
	toggleLayersGroupLayer$: Observable<any> = this.actions$
		.ofType<ToggleMapLayersAction>(CoreActionTypes.TOGGLE_MAP_LAYERS)
		.pipe(
			map(({ payload }) => this.imageryCommunicatorService.provide(payload.mapId)),
			tap((communicator: CommunicatorEntity) => {
				communicator.visualizers.forEach(v => v.toggleVisibility());
			})
		);

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

	displayedItems = new Map<string, Date>();

	shouldAbortDisplay([[prevAction, action]]: [[DisplayOverlayAction, DisplayOverlayAction], IMapState]) {
		const currentTime = new Date();

		// remove prev layers
		const mapIdsToDelete = [];
		this.displayedItems.forEach((value: Date, key: string) => {
			const isTimePassed = (currentTime.getTime() - (this.displayedItems.get(action.payload.mapId) || currentTime).getTime()) > this.config.displayDebounceTime;
			if (isTimePassed) {
				mapIdsToDelete.push(key);
			}
		});
		for (let i = 0; i < mapIdsToDelete.length; i++) {
			this.displayedItems.delete(mapIdsToDelete[i]);
		}

		let result = !this.displayedItems.has(action.payload.mapId);
		this.displayedItems.set(action.payload.mapId, currentTime);
		return result;
	}

	onDisplayOverlay([[prevAction, { payload }], mapState]: [[DisplayOverlayAction, DisplayOverlayAction], IMapState]) {
		const { overlay } = payload;
		const mapId = payload.mapId || mapState.activeMapId;
		const caseMapState = MapFacadeService.mapById(mapState.mapsList, payload.mapId || mapState.activeMapId);
		const mapData = caseMapState.data;
		const prevOverlay = mapData.overlay;
		const intersection = getFootprintIntersectionRatioInExtent(mapData.position.extentPolygon, overlay.footprint);
		const communicator = this.imageryCommunicatorService.provide(mapId);
		const { sourceType } = overlay;
		const sourceLoader: BaseMapSourceProvider = communicator.getMapSourceProvider({ sourceType });

		if (!sourceLoader) {
			return Observable.of(new SetToastMessageAction({
				toastText: 'No source loader for ' + overlay.sourceType,
				showWarningIcon: true
			}));
		}

		const sourceProviderMetaData = { ...caseMapState, data: { ...mapData, overlay } };
		this.setIsLoadingSpinner(mapId, sourceLoader, sourceProviderMetaData);


		/* -1- */
		const isActiveMapAlive = mergeMap((layer) => {
			const checkCommunicator = this.imageryCommunicatorService.provide(communicator.id);
			if (!checkCommunicator || !checkCommunicator.ActiveMap) {
				sourceLoader.removeExtraData(layer);
				return EMPTY;
			}
			return of(layer);
		});

		/* -2- */
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

		/* -3- */
		const resetView = pipe(
			mergeMap((layer) => {
				const extent = (intersection < this.config.overlayCoverage) && extentFromGeojson(overlay.footprint);
				return communicator.resetView(layer, mapData.position, extent);
			}),
			map(() => new DisplayOverlaySuccessAction(payload))
		);

		const onError = catchError((exception) => {
			console.error(exception);
			return Observable.from([
				new DisplayOverlayFailedAction({ id: overlay.id, mapId }),
				prevOverlay ? new DisplayOverlayAction({ mapId, overlay: prevOverlay }) : new BackToWorldView({ mapId })
			]);
		});

		return Observable.fromPromise(sourceLoader.createAsync(sourceProviderMetaData))
			.pipe(
				isActiveMapAlive,
				changeActiveMap,
				resetView,
				onError);
	};

	setIsLoadingSpinner(mapId, sourceLoader, sourceProviderMetaData) {
		if (sourceLoader.existsInCache(sourceProviderMetaData)) {
			this.store$.dispatch(new SetIsLoadingAcion({ mapId, show: false }));
		} else {
			this.store$.dispatch(new SetIsLoadingAcion({ mapId, show: true, text: 'Loading Overlay' }));
		}
	}

	onDisplayOverlayFilter([[prevAction, { payload }], mapState]: [[DisplayOverlayAction, DisplayOverlayAction], IMapState]) {
		const isFull = isFullOverlay(payload.overlay);
		const { overlay } = payload;
		const mapData = MapFacadeService.mapById(mapState.mapsList, payload.mapId || mapState.activeMapId).data;
		const isNotDisplayed = !(isFullOverlay(mapData.overlay) && mapData.overlay.id === overlay.id);
		return isFull && (isNotDisplayed || payload.forceFirstDisplay);
	}

	displayShouldSwitch([[prevAction, action]]: [[DisplayOverlayAction, DisplayOverlayAction], IMapState]) {
		return (action && prevAction) && (prevAction.payload.mapId === action.payload.mapId);
	}

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(IMAGERY_MAPS) protected iMapConstructors: IBaseImageryMapConstructor[],
				@Inject(mapFacadeConfig) public config: IMapFacadeConfig) {
	}
}
