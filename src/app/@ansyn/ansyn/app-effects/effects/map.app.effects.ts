import { MapInstanceChangedAction } from './../../../map-facade/actions/map.actions';
import { Inject, Injectable } from '@angular/core';
import { CesiumMapName } from '@ansyn/imagery-cesium';
import { DisabledOpenLayersMapName, OpenlayersMapName } from '@ansyn/ol';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, ofType, createEffect } from '@ngrx/effects';
import { combineLatest, EMPTY, from, Observable, of, pipe } from 'rxjs';
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
	selectMaps,
	selectOverlayOfActiveMap,
	selectOverlaysWithMapIds,
	SetIsLoadingAcion,
	SetToastMessageAction,
	ToggleMapLayersAction,
	UpdateMapAction,
	SetLayoutSuccessAction,
} from '@ansyn/map-facade';
import {
	BaseMapSourceProvider,
	bboxFromGeoJson,
	CommunicatorEntity,
	ImageryCommunicatorService,
	ImageryMapPosition,
	IMapSettings,
	polygonFromBBOX
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
import { ICaseMapState, ImageManualProcessArgs } from '../../modules/menu-items/cases/models/case.model';
import { MarkUpClass } from '../../modules/overlays/reducers/overlays.reducer';
import { IAppState } from '../app.effects.module';
import { Dictionary } from '@ngrx/entity/src/models';
import {
	SetManualImageProcessing,
	SetMapGeoEnabledModeToolsActionStore,
	ToolsActionsTypes,
	UpdateOverlaysManualProcessArgs
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
	BackToWorldSuccess,
	BackToWorldFailed
} from '../../modules/overlays/overlay-status/actions/overlay-status.actions';
import { fromPromise } from 'rxjs/internal-compatibility';
import { isEqual } from 'lodash';
import { selectGeoRegisteredOptionsEnabled } from '../../modules/menu-items/tools/reducers/tools.reducer';
import { ImageryVideoMapType } from '../../modules/imagery-video/map/imagery-video-map';
import { LoggerService } from '../../modules/core/services/logger.service';
import { SynchronizeMapsAction, ExportMapsToPngActionSuccess, ExportMapsToPngActionFailed, ContextMenuShowAngleFilter, ContextMenuShowAction, ChangeImageryMap, ChangeImageryMapFailed, ChangeImageryMapSuccess } from 'src/app/@ansyn/map-facade/actions/map.actions';

@Injectable()
export class MapAppEffects {

	actionsLogger$ = createEffect(() => this.actions$.pipe(
		ofType(
			DisplayOverlaySuccessAction,
			DisplayOverlayFailedAction,
			MapInstanceChangedAction,
			ChangeImageryMapSuccess,
			ChangeImageryMapFailed,
			ChangeImageryMap,
			ContextMenuShowAction,
			ContextMenuShowAngleFilter,
			SetLayoutSuccessAction,
			PositionChangedAction,
			SynchronizeMapsAction,
			ExportMapsToPngActionSuccess,
			ExportMapsToPngActionFailed,
			BackToWorldView,
			BackToWorldSuccess,
			BackToWorldFailed
		),
		tap((payload) => {
			this.loggerService.info(payload ? JSON.stringify(payload) : '', 'Map', payload.type); // TODO : payload doesn't have a type
		})),
		{ dispatch: false }
	);

	onDisplayOverlay$: Observable<any> = this.actions$
		.pipe(
			ofType(DisplayOverlayAction),
			startWith(null),
			pairwise(),
			withLatestFrom(this.store$.select(mapStateSelector)),
			filter(this.onDisplayOverlayFilter.bind(this))
		);

	onDisplayOverlaySwitchMap$ = this.onDisplayOverlay$
		.pipe(
			filter((data) => this.displayShouldSwitch(data))
		);

	onDisplayOverlaySwitchMapWithDebounce$ = createEffect(() => this.onDisplayOverlaySwitchMap$
		.pipe(
			debounceTime(this.config.displayDebounceTime),
			filter(this.onDisplayOverlayFilter.bind(this)),
			switchMap(this.onDisplayOverlay.bind(this))
		)
	);

	onDisplayOverlayMergeMap$ = createEffect(() => this.onDisplayOverlay$
		.pipe(
			filter((data) => !this.displayShouldSwitch(data)),
			mergeMap(this.onDisplayOverlay.bind(this))
		)
	);

	onDisplayOverlayHideLoader$ = createEffect(() => this.actions$
		.pipe(
			ofType(
				DisplayOverlaySuccessAction,
				DisplayOverlayFailedAction,
				BackToWorldView
			),
			map(payload => SetIsLoadingAcion({ mapId: payload.mapId, show: false }))
		)
	);

	onSetManualImageProcessing$ = createEffect(() => this.actions$
		.pipe(
			ofType(SetManualImageProcessing),
			withLatestFrom(this.store$.select(mapStateSelector)),
			map(([payload, mapState]: [ImageManualProcessArgs, IMapState]) => [MapFacadeService.activeMap(mapState), payload, mapState]),
			filter(([activeMap]: [ICaseMapState, ImageManualProcessArgs, IMapState]) => Boolean(activeMap.data.overlay)),
			mergeMap(([activeMap, payload]: [ICaseMapState, ImageManualProcessArgs, IMapState]) => {
				const imageManualProcessArgs = payload;
				const overlayId = activeMap.data.overlay.id;
				return [
					UpdateMapAction({
						id: activeMap.id,
						changes: { data: { ...activeMap.data, imageManualProcessArgs } }
					}),
					UpdateOverlaysManualProcessArgs({ data: { [overlayId]: payload } })
				];
			}))
	);

	displayOverlayOnNewMapInstance$ = createEffect(() => this.actions$
		.pipe(
			ofType(ImageryCreatedAction),
			withLatestFrom(this.store$.select(selectMaps)),
			filter(([, entities]: [any, Dictionary<ICaseMapState>]) => entities && Object.values(entities).length > 0),
			map(([payload, entities]: [{payload: string}, Dictionary<ICaseMapState>]) => entities[payload.payload.id]),
			filter((caseMapState: ICaseMapState) => Boolean(caseMapState && caseMapState.data.overlay)),
			map((caseMapState: ICaseMapState) => {
				startTimingLog(`LOAD_OVERLAY_${ caseMapState.data.overlay.id }`);
				return DisplayOverlayAction({
					overlay: caseMapState.data.overlay,
					mapId: caseMapState.id,
					forceFirstDisplay: true
				});
			})
		)
	);

	onOverlayFromURL$ = createEffect(() => this.actions$
		.pipe(
			ofType(DisplayOverlayAction),
			filter((payload) => !isFullOverlay(payload.overlay)),
			mergeMap((payload) => {
				return [
					RequestOverlayByIDFromBackendAction({
						overlayId: payload.overlay.id,
						sourceType: payload.overlay.sourceType,
						mapId: payload.mapId
					}),
					SetIsLoadingAcion({ mapId: payload.mapId, show: true, text: 'Loading Overlay' })
				];
			})
		)
	);

	overlayLoadingFailed$ = createEffect(() => this.actions$
		.pipe(
			ofType(DisplayOverlayFailedAction),
			tap((payload) => endTimingLog(`LOAD_OVERLAY_FAILED${ payload.id }`)),
			map(() => SetToastMessageAction({
				toastText: toastMessages.showOverlayErrorToast,
				showWarningIcon: true
			}))
		)
	);

	markupOnMapsDataChanges$ = createEffect(() => this.store$.select(selectOverlaysWithMapIds)
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
					SetMarkUp({
							classToSet: MarkUpClass.active,
							dataToSet: {
								overlaysIds: actives
							}
						}
					),
					SetMarkUp({
						classToSet: MarkUpClass.displayed,
						dataToSet: {
							overlaysIds: displayed
						}
					})
				]
			)
		));

	toggleLayersGroupLayer$ = createEffect(() => this.actions$
		.pipe(
			ofType(ToggleMapLayersAction),
			tap((payload) => {
				const communicator = this.imageryCommunicatorService.provide(payload.mapId);
				communicator.visualizers.forEach(v => v.setVisibility(payload.isVisible));
			})),
			{ dispatch: false }
		);

	activeMapGeoRegistrationChanged$ = createEffect(() => combineLatest(this.store$.select(selectActiveMapId), this.store$.select(selectOverlayOfActiveMap))
		.pipe(
			withLatestFrom(this.store$.select(selectGeoRegisteredOptionsEnabled)),
			filter(([[activeMapId, overlay], isGeoRegisteredOptionsEnabled]: [[string, IOverlay], boolean]) => Boolean(activeMapId)),
			switchMap(([[activeMapId, overlay], isGeoRegisteredOptionsEnabled]: [[string, IOverlay], boolean]) => {
				const isGeoRegistered = MapFacadeService.isOverlayGeoRegistered(overlay);
				if (!!isGeoRegistered !== isGeoRegisteredOptionsEnabled) {
					return [SetMapGeoEnabledModeToolsActionStore({payload: !!isGeoRegistered})];
				}
				return [];
			})
		));

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				protected loggerService: LoggerService,
				@Inject(mapFacadeConfig) public config: IMapFacadeConfig) {
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
		const isNotIntersect = MapFacadeService.isNotIntersect(mapData.position.extentPolygon, overlay.footprint, this.config.overlayCoverage);
		const communicator = this.imageryCommunicatorService.provide(mapId);
		const { sourceType } = overlay;
		const sourceLoader: BaseMapSourceProvider = communicator.getMapSourceProvider({
			sourceType,
			mapType: sourceType.toLowerCase().includes('video') ? ImageryVideoMapType : caseMapState.worldView.mapType
		});

		if (!sourceLoader) {
			return of(SetToastMessageAction({
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
			let newActiveMapName = this.changeImageryMap(overlay, communicator);

			if (newActiveMapName) {
				observable = fromPromise(communicator.setActiveMap(newActiveMapName, mapData.position, undefined, layer));
			}
			return observable.pipe(map(() => layer));
		});

		/* -3- */
		const resetView = pipe(
			mergeMap((layer) => {
				const extent = payloadExtent || isNotIntersect && bboxFromGeoJson(overlay.footprint);
				return communicator.resetView(layer, mapData.position, extent);
			}),
			mergeMap(() => {
				const wasOverlaySetAsExtent = !payloadExtent && isNotIntersect;
				const actionsArray: Action[] = [];
				// in order to set the new map position for unregistered overlays maps
				if (overlay.isGeoRegistered === GeoRegisteration.notGeoRegistered && wasOverlaySetAsExtent) {
					const position: ImageryMapPosition = { extentPolygon: polygonFromBBOX(bboxFromGeoJson(overlay.footprint)) };
					actionsArray.push(PositionChangedAction({ id: mapId, position, mapInstance: caseMapState }));
				}
				actionsArray.push(DisplayOverlaySuccessAction());
				return actionsArray;
			})
		);

		const onError = catchError((exception) => {
			console.error(exception);
			return from([
				DisplayOverlayFailedAction({ id: overlay.id, mapId }),
				prevOverlay ? DisplayOverlayAction({ mapId, overlay: prevOverlay }) : BackToWorldView({ mapId })
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
			this.store$.dispatch(SetIsLoadingAcion({ mapId, show: false }));
		} else {
			this.store$.dispatch(SetIsLoadingAcion({ mapId, show: true, text: 'Loading Overlay' }));
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
}
