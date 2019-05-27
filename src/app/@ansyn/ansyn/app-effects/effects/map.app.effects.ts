import { Inject, Injectable } from '@angular/core';
import { CesiumMapName } from '@ansyn/imagery-cesium';
import { DisabledOpenLayersMapName, OpenlayersMapName } from '@ansyn/ol';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { combineLatest, EMPTY, from, Observable, of, pipe } from 'rxjs';
import {
	ImageryCreatedAction,
	IMapFacadeConfig,
	IMapState,
	MapActionTypes,
	mapFacadeConfig,
	MapFacadeService,
	mapStateSelector,
	selectActiveMapId,
	selectMaps,
	selectMapsList,
	SetIsLoadingAcion,
	UpdateMapAction
} from '@ansyn/map-facade';
import {
	ToggleMapLayersAction,
	SetToastMessageAction
} from '@ansyn/map-facade'
import {
	BaseMapSourceProvider,
	CommunicatorEntity,
	ImageryCommunicatorService,
	extentFromGeojson
} from '@ansyn/imagery';
import {
	catchError,
	debounceTime,
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
import { fromPromise } from 'rxjs/internal-compatibility';
import {
	SetManualImageProcessing,
	SetMapGeoEnabledModeToolsActionStore, ToolsActionsTypes, UpdateOverlaysManualProcessArgs
} from '../../modules/menu-items/tools/actions/tools.actions';
import {
	DisplayOverlayAction,
	DisplayOverlayFailedAction,
	DisplayOverlaySuccessAction, OverlaysActionTypes,
	RequestOverlayByIDFromBackendAction, SetMarkUp
} from '../../modules/overlays/actions/overlays.actions';
import { GeoRegisteration } from '../../modules/overlays/models/overlay.model';
import {
	BackToWorldView,
	OverlayStatusActionsTypes
} from '../../modules/overlays/overlay-status/actions/overlay-status.actions';

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
			ofType<SetManualImageProcessing>(ToolsActionsTypes.SET_MANUAL_IMAGE_PROCESSING),
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
	overlayLoadingFailed$: Observable<any> = this.actions$
		.pipe(
			ofType<DisplayOverlayFailedAction>(OverlaysActionTypes.DISPLAY_OVERLAY_FAILED),
			tap((action) => endTimingLog(`LOAD_OVERLAY_FAILED${action.payload.id}`)),
			map(() => new SetToastMessageAction({
				toastText: toastMessages.showOverlayErrorToast,
				showWarningIcon: true
			}))
		);

	@Effect()
	markupOnMapsDataChanges$ = combineLatest(this.store$.select(selectActiveMapId), this.store$.select(selectMapsList))
		.pipe(
			withLatestFrom(this.store$.select(mapStateSelector)),
			filter(([[activeMapId, mapsList], mapState]: [[string, ICaseMapState[]], IMapState]) => Boolean(mapState && mapState.entities && Object.values(mapState.entities).length)),
			map(([[activeMapId, mapsList], mapState]: [[string, ICaseMapState[]], IMapState]) => {
					const actives = [];
					const displayed = [];
					Object.values(mapState.entities).forEach((map: ICaseMapState) => {
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
		.pipe(
			ofType<ToggleMapLayersAction>(MapActionTypes.TOGGLE_MAP_LAYERS),
			map(({ payload }) => this.imageryCommunicatorService.provide(payload.mapId)),
			tap((communicator: CommunicatorEntity) => {
				communicator.visualizers.forEach(v => v.toggleVisibility());
			})
		);

	@Effect()
	activeMapGeoRegistrationChanged$: Observable<any> = combineLatest(this.store$.select(selectActiveMapId), this.store$.select(selectMapsList))
		.pipe(
			withLatestFrom(this.store$.select(mapStateSelector)),
			filter(([[activeMapId, mapsList], mapState]: [[string, ICaseMapState[]], IMapState]) => Boolean(mapState.activeMapId && Object.values(mapState.entities).length)),
			map(([[activeMapId, mapsList], mapState]: [[string, ICaseMapState[]], IMapState]) => {
				const activeMapState = MapFacadeService.activeMap(mapState);
				const isGeoRegistered = activeMapState && MapFacadeService.isOverlayGeoRegistered(activeMapState.data.overlay);
				return new SetMapGeoEnabledModeToolsActionStore(!!isGeoRegistered);
			})
		);

	onDisplayOverlay([[prevAction, { payload }], mapState]: [[DisplayOverlayAction, DisplayOverlayAction], IMapState]) {
		const { overlay, extent: payloadExtent } = payload;
		const mapId = payload.mapId || mapState.activeMapId;
		const caseMapState = mapState.entities[payload.mapId || mapState.activeMapId];
		const mapData = caseMapState.data;
		const prevOverlay = mapData.overlay;
		const isNotIntersect = MapFacadeService.isNotIntersect(mapData.position.extentPolygon, overlay.footprint, this.config.overlayCoverage);
		const communicator = this.imageryCommunicatorService.provide(mapId);
		const { sourceType } = overlay;
		const sourceLoader: BaseMapSourceProvider = communicator.getMapSourceProvider({
			sourceType,
			mapType: caseMapState.worldView.mapType
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
			let observable = of(true);
			const moveToGeoRegisteredMap = overlay.isGeoRegistered !== GeoRegisteration.notGeoRegistered && communicator.activeMapName === DisabledOpenLayersMapName;
			const moveToNotGeoRegisteredMap = overlay.isGeoRegistered === GeoRegisteration.notGeoRegistered && (communicator.activeMapName === OpenlayersMapName || communicator.activeMapName === CesiumMapName);
			const newActiveMapName = moveToGeoRegisteredMap ? OpenlayersMapName : moveToNotGeoRegisteredMap ? DisabledOpenLayersMapName : '';

			if (newActiveMapName) {
				observable = fromPromise(communicator.setActiveMap(newActiveMapName, mapData.position, undefined, layer));
			}
			return observable.pipe(map(() => layer));
		});

		/* -3- */
		const resetView = pipe(
			mergeMap((layer) => {
				const extent = payloadExtent || isNotIntersect && extentFromGeojson(overlay.footprint);
				return communicator.resetView(layer, mapData.position, extent);
			}),
			map(() => new DisplayOverlaySuccessAction(payload))
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
		if (payload.force) {
			return true;
		}

		const payloadOverlay = payload.overlay;
		const isFull = isFullOverlay(payloadOverlay);
		if (!isFull) {
			return false;
		}

		const caseMapState: ICaseMapState = MapFacadeService.mapById(Object.values(mapState.entities), payload.mapId || mapState.activeMapId);
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

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(mapFacadeConfig) public config: IMapFacadeConfig) {
	}
}
