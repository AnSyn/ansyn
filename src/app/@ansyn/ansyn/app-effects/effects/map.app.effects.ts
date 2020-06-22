import { Inject, Injectable } from '@angular/core';
import { CesiumMapName } from '@ansyn/imagery-cesium';
import { DisabledOpenLayersMapName, OpenlayersMapName } from '@ansyn/ol';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { combineLatest, EMPTY, forkJoin, from, Observable, of, pipe } from 'rxjs';
import {
	ImageryCreatedAction,
	IMapFacadeConfig,
	IMapState,
	MapActionTypes,
	mapFacadeConfig,
	MapFacadeService,
	mapStateSelector,
	PositionChangedAction,
	selectActiveMapId,
	selectMapPositionByMapId,
	selectMaps,
	selectOverlayOfActiveMap,
	selectOverlaysWithMapIds,
	SetIsLoadingAcion,
	SetToastMessageAction,
	SynchronizeMapsAction,
	ToggleMapLayersAction,
	UpdateMapAction
} from '@ansyn/map-facade';
import {
	BaseMapSourceProvider,
	bboxFromGeoJson,
	IBaseImageryLayer,
	ImageryCommunicatorService,
	ImageryMapPosition,
	IMapSettings,
	polygonFromBBOX,
	polygonsDontIntersect
} from '@ansyn/imagery';
import {
	catchError,
	debounceTime,
	distinctUntilChanged,
	filter,
	map,
	mergeMap,
	pairwise,
	startWith,
	switchMap,
	tap,
	withLatestFrom
} from 'rxjs/operators';
import { toastMessages } from '../../modules/core/models/toast-messages';
import { endTimingLog, startTimingLog } from '../../modules/core/utils/logs/timer-logs';
import { isFullOverlay } from '../../modules/core/utils/overlays';
import { ICaseMapState } from '../../modules/menu-items/cases/models/case.model';
import { MarkUpClass } from '../../modules/overlays/reducers/overlays.reducer';
import { IAppState } from '../app.effects.module';
import { Dictionary } from '@ngrx/entity/src/models';
import {
	SetActiveCenter,
	SetMapGeoEnabledModeToolsActionStore, SetMapSearchBox
} from '../../modules/menu-items/tools/actions/tools.actions';
import {
	DisplayOverlayAction,
	DisplayOverlayFailedAction,
	DisplayOverlaySuccessAction,
	OverlaysActionTypes,
	RequestOverlayByIDFromBackendAction,
	SetMarkUp
} from '../../modules/overlays/actions/overlays.actions';
import { GeoRegisteration, IOverlay } from '../../modules/overlays/models/overlay.model';
import {
	BackToWorldView,
	OverlayStatusActionsTypes,
	SetManualImageProcessing,
	UpdateOverlaysManualProcessArgs
} from '../../modules/overlays/overlay-status/actions/overlay-status.actions';
import { fromPromise } from 'rxjs/internal-compatibility';
import { isEqual } from 'lodash';
import { selectGeoRegisteredOptionsEnabled } from '../../modules/menu-items/tools/reducers/tools.reducer';
import { ImageryVideoMapType } from '@ansyn/imagery-video';
import { LoggerService } from '../../modules/core/services/logger.service';
import {
	IOverlayStatusConfig,
	overlayStatusConfig
} from '../../modules/overlays/overlay-status/config/overlay-status-config';
import { SetActiveCenterTriggerAction, SetMapSearchBoxTriggerAction } from '../../../map-facade/actions/map.actions';

@Injectable()
export class MapAppEffects {

	@Effect({ dispatch: false })
	actionsLogger$: Observable<any> = this.actions$.pipe(
		ofType(
			OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS,
			OverlaysActionTypes.DISPLAY_OVERLAY_FAILED,
			MapActionTypes.MAP_INSTANCE_CHANGED_ACTION,
			MapActionTypes.CHANGE_IMAGERY_MAP_SUCCESS,
			MapActionTypes.CHANGE_IMAGERY_MAP_FAILED,
			MapActionTypes.CHANGE_IMAGERY_MAP,
			MapActionTypes.CONTEXT_MENU.SHOW,
			MapActionTypes.CONTEXT_MENU.ANGLE_FILTER_SHOW,
			MapActionTypes.SET_LAYOUT_SUCCESS,
			MapActionTypes.POSITION_CHANGED,
			MapActionTypes.SYNCHRONIZE_MAPS,
			OverlayStatusActionsTypes.BACK_TO_WORLD_VIEW,
			OverlayStatusActionsTypes.BACK_TO_WORLD_SUCCESS,
			OverlayStatusActionsTypes.BACK_TO_WORLD_FAILED
		),
		tap((action) => {
			this.loggerService.info(action.payload ? JSON.stringify(action.payload) : '', 'Map', action.type);
		}));

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
		.pipe(
			ofType<DisplayOverlayAction>(
				OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS,
				OverlaysActionTypes.DISPLAY_OVERLAY_FAILED,
				OverlayStatusActionsTypes.BACK_TO_WORLD_VIEW
			),
			map(({ payload }: DisplayOverlayAction) => new SetIsLoadingAcion({ mapId: payload.mapId, show: false }))
		);

	@Effect()
	onSetManualImageProcessing$: Observable<any> = this.actions$
		.pipe(
			ofType<SetManualImageProcessing>(OverlayStatusActionsTypes.SET_MANUAL_IMAGE_PROCESSING),
			withLatestFrom(this.store$.select(mapStateSelector)),
			map(([action, mapState]: [SetManualImageProcessing, IMapState]) => [MapFacadeService.activeMap(mapState), action, mapState]),
			filter(([activeMap]: [ICaseMapState, SetManualImageProcessing, IMapState]) => Boolean(activeMap.data.overlay)),
			mergeMap(([activeMap, action]: [ICaseMapState, SetManualImageProcessing, IMapState]) => {
				const imageManualProcessArgs = action.payload;
				const overlayId = activeMap.data.overlay.id;
				return [
					new UpdateMapAction({
						id: activeMap.id,
						changes: { data: { ...activeMap.data, imageManualProcessArgs } }
					}),
					new UpdateOverlaysManualProcessArgs({ data: { [overlayId]: action.payload } })
				];
			}));

	@Effect()
	displayOverlayOnNewMapInstance$: Observable<any> = this.actions$
		.pipe(
			ofType(MapActionTypes.IMAGERY_CREATED),
			withLatestFrom(this.store$.select(selectMaps)),
			filter(([action, entities]: [ImageryCreatedAction, Dictionary<ICaseMapState>]) => entities && Object.values(entities).length > 0),
			map(([action, entities]: [ImageryCreatedAction, Dictionary<ICaseMapState>]) => entities[action.payload.id]),
			filter((caseMapState: ICaseMapState) => Boolean(caseMapState && caseMapState.data.overlay)),
			map((caseMapState: ICaseMapState) => {
				startTimingLog(`LOAD_OVERLAY_${ caseMapState.data.overlay.id }`);
				return new DisplayOverlayAction({
					overlay: caseMapState.data.overlay,
					mapId: caseMapState.id,
					forceFirstDisplay: true
				});
			})
		);

	@Effect()
	onOverlayFromURL$: Observable<any> = this.actions$
		.pipe(
			ofType<DisplayOverlayAction>(OverlaysActionTypes.DISPLAY_OVERLAY),
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
	onSetActiveCenterTrigger$: Observable<any> = this.actions$
		.pipe(
			ofType<SetActiveCenterTriggerAction>(MapActionTypes.SET_ACTIVE_CENTER_TRIGGER),
			map((action: SetActiveCenterTriggerAction) => new SetActiveCenter(action.payload))
		);

	@Effect()
	onMapSearchBoxTrigger$: Observable<any> = this.actions$
		.pipe(
			ofType<SetMapSearchBoxTriggerAction>(MapActionTypes.MAP_SEARCH_BOX_TRIGGER),
			map((action: SetMapSearchBoxTriggerAction) => new SetMapSearchBox(action.payload))
		);

	@Effect({ dispatch: false })
	onDisplayOverlayCheckItsExtent$ = this.actions$.pipe(
		ofType(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS),
		mergeMap((action: DisplayOverlaySuccessAction) =>
			of(action.payload).pipe(
				withLatestFrom(this.store$.select(selectMapPositionByMapId(action.payload.mapId)))
			)
		),
		tap( ([payload, position]: [any, ImageryMapPosition]) => {
			const isNotIntersect = polygonsDontIntersect(position.extentPolygon, payload.overlay.footprint, 0.2);
			if (isNotIntersect) {
				const comm = this.imageryCommunicatorService.provide(payload.mapId);
				comm.ActiveMap.fitToExtent(bboxFromGeoJson(payload.overlay.footprint))
			}
		})
	)

	@Effect({ dispatch: false })
	onSynchronizeAppMaps$: Observable<any> = this.actions$.pipe(
		ofType(MapActionTypes.SYNCHRONIZE_MAPS),
		withLatestFrom(this.store$.select(mapStateSelector)),
		switchMap(([action, mapState]: [SynchronizeMapsAction, IMapState]) => {
			const mapId = action.payload.mapId;
			const mapSettings: IMapSettings = mapState.entities[mapId];
			const mapPosition = mapSettings.data.position;
			const setPositionObservables = [];
			// handles only maps with overlays
			Object.values(mapState.entities).forEach((mapItem: IMapSettings) => {
				if (mapId !== mapItem.id && mapItem.data.overlay) {
					const comm = this.imageryCommunicatorService.provide(mapItem.id);
					setPositionObservables.push(this.setPosition(mapPosition, comm, mapItem));
				}
			});
			return forkJoin(setPositionObservables).pipe(map(() => [action, mapState]));
		})
	);


	@Effect()
	overlayLoadingFailed$: Observable<any> = this.actions$
		.pipe(
			ofType<DisplayOverlayFailedAction>(OverlaysActionTypes.DISPLAY_OVERLAY_FAILED),
			tap((action) => endTimingLog(`LOAD_OVERLAY_FAILED${ action.payload.id }`)),
			map(() => new SetToastMessageAction({
				toastText: toastMessages.showOverlayErrorToast,
				showWarningIcon: true
			}))
		);

	@Effect()
	markupOnMapsDataChanges$ = this.store$.select(selectOverlaysWithMapIds)
		.pipe(
			distinctUntilChanged((dataA, dataB) => isEqual(dataA, dataB)),
			map((overlayWithMapIds: { overlay: any, mapId: string, isActive: boolean }[]) => {
					const actives = [];
					const displayed = [];
					overlayWithMapIds.forEach((data: { overlay: any, mapId: string, isActive: boolean }) => {
						if (Boolean(data.overlay)) {
							if (data.isActive) {
								actives.push(data.overlay.id);
							} else {
								displayed.push(data.overlay.id);
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
		.pipe(
			ofType<ToggleMapLayersAction>(MapActionTypes.TOGGLE_MAP_LAYERS),
			tap(({ payload }) => {
				const communicator = this.imageryCommunicatorService.provide(payload.mapId);
				communicator.visualizers.forEach(v => v.setVisibility(payload.isVisible));
			})
		);

	@Effect()
	activeMapGeoRegistrationChanged$: Observable<any> = combineLatest(this.store$.select(selectActiveMapId), this.store$.select(selectOverlayOfActiveMap))
		.pipe(
			withLatestFrom(this.store$.select(selectGeoRegisteredOptionsEnabled)),
			filter(([[activeMapId, overlay], isGeoRegisteredOptionsEnabled]: [[string, IOverlay], boolean]) => Boolean(activeMapId)),
			switchMap(([[activeMapId, overlay], isGeoRegisteredOptionsEnabled]: [[string, IOverlay], boolean]) => {
				const isGeoRegistered = MapFacadeService.isOverlayGeoRegistered(overlay);
				if (!!isGeoRegistered !== isGeoRegisteredOptionsEnabled) {
					return [new SetMapGeoEnabledModeToolsActionStore(!!isGeoRegistered)];
				}
				return [];
			})
		);

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				protected loggerService: LoggerService,
				@Inject(mapFacadeConfig) public config: IMapFacadeConfig,
				@Inject(overlayStatusConfig) public overlayStatusConfig: IOverlayStatusConfig
	) {
	}

	changeImageryMap(overlay, communicator): string | null {
		if (overlay.sensorType.toLowerCase().includes('video') && communicator.activeMapName !== ImageryVideoMapType) {
			return ImageryVideoMapType;
		}
		if (overlay.isGeoRegistered !== GeoRegisteration.notGeoRegistered && (communicator.activeMapName === DisabledOpenLayersMapName || communicator.activeMapName === ImageryVideoMapType)) {
			return OpenlayersMapName;
		}
		if (overlay.isGeoRegistered === GeoRegisteration.notGeoRegistered && (communicator.activeMapName === OpenlayersMapName || communicator.activeMapName === CesiumMapName || communicator.activeMapName === ImageryVideoMapType)) {
			return DisabledOpenLayersMapName;
		}
		return null;
	}

	onDisplayOverlay([[prevAction, { payload }], mapState]: [[DisplayOverlayAction, DisplayOverlayAction], IMapState]) {
		const { overlay, extent: payloadExtent } = payload;
		const mapId = payload.mapId || mapState.activeMapId;
		const caseMapState = mapState.entities[payload.mapId || mapState.activeMapId];
		const mapData = caseMapState.data;
		const prevOverlay = mapData.overlay;
		const isNotIntersect = polygonsDontIntersect(mapData.position.extentPolygon, overlay.footprint, this.config.overlayCoverage);
		const communicator = this.imageryCommunicatorService.provide(mapId);
		const { sourceType } = overlay;
		const sourceLoader: BaseMapSourceProvider = communicator.getMapSourceProvider({
			sourceType,
			mapType: sourceType.toLowerCase().includes('video') ? ImageryVideoMapType : caseMapState.worldView.mapType
		});

		if (!sourceLoader) {
			return of(new SetToastMessageAction({
				toastText: 'No source loader for ' + overlay.sourceType,
				showWarningIcon: true
			}));
		}

		const sourceProviderMetaData = { ...caseMapState, data: { ...mapData, overlay } };
		this.setIsLoadingSpinner(mapId, sourceLoader, sourceProviderMetaData);


		/* -1- */
		const isActiveMapAlive = mergeMap((layer: IBaseImageryLayer) => {
			const checkCommunicator = this.imageryCommunicatorService.provide(communicator.id);
			if (!checkCommunicator || !checkCommunicator.ActiveMap) {
				sourceLoader.removeExtraData(layer);
				return EMPTY;
			}
			return of(layer);
		});

		/* -2- */
		const changeActiveMap = mergeMap((layer: IBaseImageryLayer) => {
			let observable: Observable<any> = of(true);
			let newActiveMapName = this.changeImageryMap(overlay, communicator);

			if (newActiveMapName) {
				observable = fromPromise(communicator.setActiveMap(newActiveMapName, mapData.position, undefined, layer));
			}
			return observable.pipe(map(() => layer));
		});

		/* -3- */
		const resetView = pipe(
			mergeMap((layer: IBaseImageryLayer) => {
				const extent = payloadExtent || isNotIntersect && bboxFromGeoJson(overlay.footprint);
				return communicator.resetView(layer, mapData.position, extent);
			}),
			mergeMap(() => {
				const wasOverlaySetAsExtent = !payloadExtent && isNotIntersect;
				const actionsArray: Action[] = [];
				// in order to set the new map position for unregistered overlays maps
				if (overlay.isGeoRegistered === GeoRegisteration.notGeoRegistered && wasOverlaySetAsExtent) {
					const position: ImageryMapPosition = { extentPolygon: polygonFromBBOX(bboxFromGeoJson(overlay.footprint)) };
					actionsArray.push(new PositionChangedAction({ id: mapId, position, mapInstance: caseMapState }));
				}
				actionsArray.push(new DisplayOverlaySuccessAction(payload));
				return actionsArray;
			})
		);

		const onError = catchError((exception) => {
			console.error(exception);
			return from([
				new DisplayOverlayFailedAction({ id: overlay.id, mapId }),
				prevOverlay ? new DisplayOverlayAction({ mapId, overlay: prevOverlay }) : new BackToWorldView({ mapId })
			]);
		});

		return fromPromise(sourceLoader.createAsync(sourceProviderMetaData))
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
		if (!Boolean(mapState)) {
			return false;
		}

		if (payload.force) {
			return true;
		}

		const payloadOverlay = payload.overlay;
		const isFull = isFullOverlay(payloadOverlay);
		if (!isFull) {
			return false;
		}

		const caseMapState: IMapSettings = MapFacadeService.mapById(Object.values(mapState.entities), payload.mapId || mapState.activeMapId);
		if (!caseMapState) {
			return false;
		}

		const mapData = caseMapState.data;
		const isNotDisplayed = !(isFullOverlay(mapData.overlay) && mapData.overlay.id === payloadOverlay.id);
		return (isNotDisplayed || payload.forceFirstDisplay);
	}

	displayShouldSwitch([[prevAction, action]]: [[DisplayOverlayAction, DisplayOverlayAction], IMapState]) {
		return (action && prevAction) && (prevAction.payload.mapId === action.payload.mapId);
	}

	setPosition(position: ImageryMapPosition, comm, mapItem): Observable<any> {
		if (mapItem.data.overlay.isGeoRegistered === GeoRegisteration.notGeoRegistered) {
			return this.cantSyncMessage();
		}
		const isNotIntersect = polygonsDontIntersect(position.extentPolygon, mapItem.data.overlay.footprint, this.config.overlayCoverage);
		if (isNotIntersect) {
			return this.cantSyncMessage();
		}
		return comm.setPosition(position);
	}

	cantSyncMessage(): Observable<any> {
		this.store$.dispatch(new SetToastMessageAction({
			toastText: 'At least one map couldn\'t be synchronized',
			showWarningIcon: true
		}));
		return EMPTY;
	}
}
