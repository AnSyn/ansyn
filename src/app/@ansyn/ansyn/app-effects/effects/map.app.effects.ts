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
	selectMaps,
	selectOverlayOfActiveMap,
	selectOverlaysWithMapIds,
	SetActiveCenterTriggerAction,
	SetIsLoadingAcion,
	SetMapSearchBoxTriggerAction,
	SetToastMessageAction,
	SynchronizeMapsAction,
	ToggleMapLayersAction,
	UpdateMapAction
} from '@ansyn/map-facade';
import {
	BaseMapSourceProvider,
	bboxFromGeoJson, getPolygonIntersectionRatio,
	IBaseImageryLayer,
	ImageryCommunicatorService,
	IImageryMapPosition,
	IMapSettings,
	polygonFromBBOX,
	polygonsDontIntersect, GetProvidersMapsService, ImageryLayerProperties, ImageryMapExtentPolygon, IMapSettingsData
} from '@ansyn/imagery';
import {
	catchError,
	concatMap,
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
import { CaseGeoFilter, ICaseMapState } from '../../modules/menu-items/cases/models/case.model';
import { MarkUpClass, selectRegion } from '../../modules/overlays/reducers/overlays.reducer';
import { IAppState } from '../app.effects.module';
import { Dictionary } from '@ngrx/entity/src/models';
import {
	SetActiveCenter,
	SetMapGeoEnabledModeToolsActionStore,
	SetMapSearchBox
} from '../../modules/menu-items/tools/actions/tools.actions';
import {
	DisplayOverlayAction,
	DisplayOverlayFailedAction,
	DisplayOverlaySuccessAction,
	OverlaysActionTypes,
	RequestOverlayByIDFromBackendAction,
	SetMarkUp,
	SetOverlaysCriteriaAction,
	SetOverlaysStatusMessageAction
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
import {
	IOverlayStatusConfig,
	overlayStatusConfig
} from '../../modules/overlays/overlay-status/config/overlay-status-config';
import { MeasureDistanceVisualizer } from '../../modules/plugins/openlayers/plugins/visualizers/tools/measure-distance.visualizer';
import { selectGeoFilterStatus } from '../../modules/status-bar/reducers/status-bar.reducer';
import { booleanEqual, distance, feature } from '@turf/turf';
import { StatusBarActionsTypes, UpdateGeoFilterStatus } from '../../modules/status-bar/actions/status-bar.actions';
import {
	IScreenViewConfig,
	ScreenViewConfig
} from '../../modules/plugins/openlayers/plugins/visualizers/models/screen-view.model';
import { GeometryObject } from '@turf/helpers';

const FOOTPRINT_INSIDE_MAP_RATIO = 1;

@Injectable()
export class MapAppEffects {

	onDisplayOverlay$: Observable<any> = this.actions$
		.pipe(
			ofType<DisplayOverlayAction>(OverlaysActionTypes.DISPLAY_OVERLAY),
			startWith<any, null>(null),
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
			filter((action: DisplayOverlayAction) => action.payload.overlay && !isFullOverlay(action.payload.overlay)),
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
				communicator.visualizers.forEach(v => {
					if (!(v instanceof MeasureDistanceVisualizer)) {
						v.setVisibility(payload.isVisible);
					}
				})
			})
		);

	@Effect()
	activeMapGeoRegistrationChanged$: Observable<any> = combineLatest([this.store$.select(selectActiveMapId), this.store$.select(selectOverlayOfActiveMap)])
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

	@Effect()
	searchByExtentPolygon$: Observable<any> = this.actions$.pipe(
		ofType(MapActionTypes.POSITION_CHANGED, MapActionTypes.SET_ACTIVE_MAP_ID, StatusBarActionsTypes.UPDATE_GEO_FILTER_STATUS),
		debounceTime(this.screenViewConfig.debounceTime),
		withLatestFrom(this.store$.select(selectMaps), this.store$.select(selectActiveMapId), this.store$.select(selectGeoFilterStatus), this.store$.select(selectRegion)),
		filter(([action, mapList, activeMapId, geoFilterStatus, { geometry }]) => Boolean(mapList[activeMapId]) && geoFilterStatus.type === CaseGeoFilter.ScreenView),
		map(([action, mapList, activeMapId, { active }, { geometry }]) => {
			const { position, overlay }: IMapSettingsData = mapList[activeMapId].data;
			const oldCenter = position.projectedState.center;
			// @ts-ignore
			const newCenter = action.payload.position.projectedState.center;
			console.log('old center', oldCenter);
			console.log('new center', newCenter);
			console.log(action);
			return [position.extentPolygon, active, geometry, overlay];
		}),
		filter(([extentPolygon, isGeoFilterStatusActive, geometry, overlay]: [ImageryMapExtentPolygon, boolean, GeometryObject, IOverlay]) => !booleanEqual(extentPolygon, geometry) && !Boolean(overlay)),
		concatMap(([extentPolygon, isGeoFilterStatusActive, geometry, overlay]: [ImageryMapExtentPolygon, boolean, GeometryObject, IOverlay]) => {
			const actions = [];
			const [[extentTopLeft, extentTopRight]] = extentPolygon.coordinates;
			const extentWidth = Math.round(distance(extentTopLeft, extentTopRight, { units: 'meters' }));

			if (extentWidth > this.screenViewConfig.extentWidthSearchLimit) {
				actions.push(new SetOverlaysStatusMessageAction({ message: 'Zoom in to get new overlays' }));
			} else {
				const extent = feature(extentPolygon, { searchMode: CaseGeoFilter.ScreenView });
				actions.push(new SetOverlaysCriteriaAction({ region: extent }));

				if (isGeoFilterStatusActive) {
					actions.push(new UpdateGeoFilterStatus({ active: false }));
				}
			}
			return actions;
		})
	);

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				protected getProvidersMapsService: GetProvidersMapsService,
				@Inject(mapFacadeConfig) public config: IMapFacadeConfig,
				@Inject(overlayStatusConfig) public overlayStatusConfig: IOverlayStatusConfig,
				@Inject(ScreenViewConfig) public screenViewConfig: IScreenViewConfig
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
		const intersectionRatio = getPolygonIntersectionRatio(this.bboxPolygon(mapData.position.extentPolygon), overlay.footprint);
		const communicator = this.imageryCommunicatorService.provide(mapId);
		const { sourceType } = overlay;
		const sourceLoader: BaseMapSourceProvider = this.getProvidersMapsService.getMapSourceProvider(sourceType.toLowerCase().includes('video') ? ImageryVideoMapType : caseMapState.worldView.mapType, sourceType);

		if (!sourceLoader) {
			return of(new SetToastMessageAction({
				toastText: 'No source loader for ' + overlay.sourceType,
				showWarningIcon: true
			}));
		}

		const sourceProviderMetaData = { ...caseMapState, data: { ...mapData, overlay } };
		this.setIsLoadingSpinner(mapId, sourceLoader, sourceProviderMetaData);


		/* -0- */
		const setIsOverlayProperties = map((layer: IBaseImageryLayer) => {
			layer.set(ImageryLayerProperties.IS_OVERLAY, true);
			return layer;
		});

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
				const isFootprintExtentInsideMapExtent = intersectionRatio === FOOTPRINT_INSIDE_MAP_RATIO;
				const extent = payloadExtent || !isFootprintExtentInsideMapExtent && bboxFromGeoJson(overlay.footprint);
				return communicator.resetView(layer, mapData.position, extent);
			}),
			mergeMap(() => {
				const wasOverlaySetAsExtent = !payloadExtent && intersectionRatio < this.config.overlayCoverage;
				const actionsArray: Action[] = [];
				// in order to set the new map position for unregistered overlays maps
				if (overlay.isGeoRegistered === GeoRegisteration.notGeoRegistered && wasOverlaySetAsExtent) {
					const position: IImageryMapPosition = { extentPolygon: this.bboxPolygon(overlay.footprint) };
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
				setIsOverlayProperties,
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

	setPosition(position: IImageryMapPosition, comm, mapItem): Observable<any> {
		if (mapItem.data.overlay.isGeoRegistered === GeoRegisteration.notGeoRegistered) {
			return this.cantSyncMessage();
		}
		const isNotIntersect = polygonsDontIntersect(this.bboxPolygon(position.extentPolygon), mapItem.data.overlay.footprint, this.config.overlayCoverage);
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

	private bboxPolygon(polygon) {
		return polygonFromBBOX(bboxFromGeoJson(polygon));
	}
}
