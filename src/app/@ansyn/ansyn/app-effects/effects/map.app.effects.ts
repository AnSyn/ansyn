import { Inject, Injectable } from '@angular/core';
import { CesiumMapName } from '@ansyn/imagery-cesium';
import { DisabledOpenLayersMapName, OpenlayersMapName } from '@ansyn/ol';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { combineLatest, EMPTY, forkJoin, from, Observable, of, pipe } from 'rxjs';
import {
	ForceRenderMaps,
	ImageryCreatedAction,
	IMapFacadeConfig,
	IMapState,
	MapActionTypes,
	mapFacadeConfig,
	MapFacadeService,
	mapStateSelector,
	PositionChangedAction,
	selectActiveMapId,
	selectFourViewsMode, selectLayout,
	selectMaps,
	selectMapsIds,
	selectOverlayOfActiveMap,
	selectOverlaysWithMapIds,
	SetActiveCenterTriggerAction,
	SetFourViewsModeAction,
	SetIsLoadingAcion,
	SetLayoutAction,
	SetLayoutSuccessAction,
	SetMapSearchBoxTriggerAction,
	SetToastMessageAction,
	SynchronizeMapsAction,
	ToggleFooter,
	ToggleMapLayersAction,
	UpdateMapAction
} from '@ansyn/map-facade';
import {
	BaseMapSourceProvider,
	bboxFromGeoJson,
	calculatePolygonWidth,
	GetProvidersMapsService,
	IBaseImageryLayer,
	IImageryMapPosition,
	ImageryCommunicatorService,
	ImageryLayerProperties,
	ImageryMapExtentPolygon,
	IMapSettings,
	IMapSettingsData,
	polygonFromBBOX,
	polygonsDontIntersect
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
import { CaseGeoFilter, ICaseMapState, ICaseTimeState } from '../../modules/menu-items/cases/models/case.model';
import {
	MarkUpClass,
	selectFourViewsOverlays,
	selectRegion,
	selectTime
} from '../../modules/overlays/reducers/overlays.reducer';
import { IAppState } from '../app.effects.module';
import { Dictionary } from '@ngrx/entity';
import {
	AddMeasureAction,
	CreateMeasureDataAction,
	RemoveMeasureAction,
	RemoveMeasureDataAction,
	SetActiveCenter,
	SetMapGeoEnabledModeToolsActionStore,
	SetMapSearchBox,
	ToolsActionsTypes,
	UpdateMeasureDataOptionsAction,
	UpdateMeasureLabelAction
} from '../../modules/status-bar/components/tools/actions/tools.actions';
import {
	DisplayOverlayAction,
	DisplayOverlayFailedAction,
	DisplayOverlayFromStoreAction,
	DisplayOverlaySuccessAction,
	OverlaysActionTypes,
	RequestOverlayByIDFromBackendAction,
	SetFourViewsOverlaysAction,
	SetMarkUp,
	SetOverlaysCriteriaAction,
	SetOverlaysStatusMessageAction,
	UpdateOverlay
} from '../../modules/overlays/actions/overlays.actions';
import {
	fourViewsConfig,
	GeoRegisteration,
	IFourViews,
	IFourViewsConfig,
	IOverlay
} from '../../modules/overlays/models/overlay.model';
import {
	BackToWorldView,
	OverlayStatusActionsTypes
} from '../../modules/overlays/overlay-status/actions/overlay-status.actions';
import { cloneDeep, isEqual, clone } from 'lodash';
import { selectGeoRegisteredOptionsEnabled } from '../../modules/status-bar/components/tools/reducers/tools.reducer';
import { ImageryVideoMapType } from '@ansyn/imagery-video';
import {
	IOverlayStatusConfig,
	overlayStatusConfig
} from '../../modules/overlays/overlay-status/config/overlay-status-config';
import { IGeoFilterStatus, selectGeoFilterStatus } from '../../modules/status-bar/reducers/status-bar.reducer';
import { StatusBarActionsTypes, UpdateGeoFilterStatus } from '../../modules/status-bar/actions/status-bar.actions';
import {
	IScreenViewConfig,
	ScreenViewConfig
} from '../../modules/plugins/openlayers/plugins/visualizers/models/screen-view.model';
import { feature } from '@turf/turf';
import { CasesActionTypes } from '../../modules/menu-items/cases/actions/cases.actions';
import { casesConfig } from '../../modules/menu-items/cases/services/cases.service';
import { createNewMeasureData } from '../../modules/status-bar/components/tools/models/tools.model';
import { rxPreventCrash } from '../../modules/core/utils/rxjs/operators/rxPreventCrash';
import { ICasesConfig } from '../../modules/menu-items/cases/models/cases-config';
import { TranslateService } from '@ngx-translate/core';
import { MultipleOverlaysSourceProvider } from '../../modules/overlays/services/multiple-source-provider';
import { Point } from 'geojson';
import { IFetchParams } from '../../modules/overlays/models/base-overlay-source-provider.model';
import { regionLayerDefaultName, regionLayerId } from '../../modules/menu-items/layers-manager/models/layers.model';
import { UpdateLayer } from '../../modules/menu-items/layers-manager/actions/layers.actions';
import { OverlaysService } from '../../modules/overlays/services/overlays.service';
import { UnSelectMenuItemAction } from '@ansyn/menu';

@Injectable()
export class MapAppEffects {
	lastOverlayIds: Map<string, string>;

	onDisplayOverlay$: Observable<any> = this.actions$
		.pipe(
			ofType<DisplayOverlayAction>(OverlaysActionTypes.DISPLAY_OVERLAY),
			startWith<any, null>(null),
			pairwise(),
			withLatestFrom(this.store$.select(mapStateSelector)),
			filter(this.onDisplayOverlayFilter.bind(this))
		);


	@Effect({ dispatch: false })
	onUpdateOverlay$: Observable<any> = this.actions$
		.pipe(
			ofType<UpdateOverlay>(OverlaysActionTypes.UPDATE_OVERLAY),
			tap(({ payload }: UpdateOverlay) => {
				const mapId = Array.from(this.lastOverlayIds.keys()).find(
					mapId => this.lastOverlayIds.get(mapId) === payload.id
				);
				if (mapId) {
					this.store$.dispatch(new DisplayOverlayFromStoreAction({ id: <string>payload.id, mapId: mapId }))
				}
			})
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
			tap(({ payload }) => this.lastOverlayIds.delete(payload.mapId)),
			map(({ payload }: DisplayOverlayAction) => new SetIsLoadingAcion({ mapId: payload.mapId, show: false }))
		);

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
				communicator.visualizers.forEach(visualizer => visualizer.setVisibility(payload.isVisible));
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
		ofType(MapActionTypes.POSITION_CHANGED, MapActionTypes.SET_ACTIVE_MAP_ID, StatusBarActionsTypes.UPDATE_GEO_FILTER_STATUS, StatusBarActionsTypes.SEARCH_ACTION),
		debounceTime(this.screenViewConfig.debounceTime),
		concatMap((action: Action) => of(action).pipe(
			withLatestFrom(this.store$.select(selectMaps), this.store$.select(selectActiveMapId), this.store$.select(selectGeoFilterStatus), this.store$.select(selectRegion), this.store$.select(selectFourViewsMode),
				(action: Action, mapList, activeMapId, geoFilterStatus, { properties }, isFourViewsMode): [ImageryMapExtentPolygon, IGeoFilterStatus, [number, number, number], [number, number], number, number, IOverlay, boolean, boolean] => {
					const { position, overlay }: IMapSettingsData = mapList[activeMapId].data;
					const { center, zoom } = position.projectedState;

					return [position.extentPolygon, geoFilterStatus, center, properties.center, zoom, properties.zoom, overlay, action.type === StatusBarActionsTypes.SEARCH_ACTION || properties.forceScreenViewSearch, isFourViewsMode];
				})
		)),
		filter(([extentPolygon, geoFilterStatus, newCenter, oldCenter, newZoom, oldZoom, overlay, forceScreenViewSearch, isFourViewsMode]: [ImageryMapExtentPolygon, IGeoFilterStatus, [number, number, number], [number, number], number, number, IOverlay, boolean, boolean]) => {
			return geoFilterStatus.type === CaseGeoFilter.ScreenView && !Boolean(overlay) && (forceScreenViewSearch || (!isEqual(oldCenter, newCenter) || !isEqual(oldZoom, newZoom))) && !isFourViewsMode;
		}),
		concatMap(([extentPolygon, geoFilterStatus, newCenter, oldCenter, newZoom, oldZoom, overlay, isFromSearch, isFourViewsMode]: [ImageryMapExtentPolygon, IGeoFilterStatus, [number, number, number], [number, number], number, number, IOverlay, boolean, boolean]) => {
			const actions: Action[] = [];

			const extentWidth = calculatePolygonWidth(extentPolygon);
			if (extentWidth > this.screenViewConfig.extentWidthSearchLimit) {
				actions.push(new SetOverlaysStatusMessageAction({ message: 'Zoom in to get new overlays' }));
			} else {
				const extent = feature(extentPolygon, {
					searchMode: CaseGeoFilter.ScreenView,
					center: newCenter,
					zoom: newZoom
				});
				actions.push(new SetOverlaysCriteriaAction({ region: extent }));

				if (geoFilterStatus.active) {
					actions.push(new UpdateGeoFilterStatus({ active: false }));
				}
			}

			return actions;
		})
	);

	@Effect()
	onLoadCasForceMapsRender$ = this.actions$.pipe(
		ofType(CasesActionTypes.SELECT_CASE_SUCCESS),
		map(() => new ForceRenderMaps())
	);

	@Effect()
	onDisableFourViewsMode$ = this.actions$.pipe(
		ofType(MapActionTypes.SET_FOUR_VIEWS_MODE),
		filter(({ payload }: SetFourViewsModeAction) => !payload?.active),
		withLatestFrom(this.store$.select(selectActiveMapId)),
		mergeMap(([payload, activeMapID]: [SetFourViewsModeAction, string]) => {
			const oneMapLayout = 'layout1';
			const regionLayerName = this.translateService.instant(regionLayerDefaultName);
			return [
				new SetLayoutAction(oneMapLayout),
				new ToggleFooter(false),
				new UpdateGeoFilterStatus({ active: false, type: CaseGeoFilter.ScreenView }),
				new SetFourViewsOverlaysAction({}),
				new UpdateLayer({ id: regionLayerId, name: regionLayerName }),
				new BackToWorldView({ mapId: activeMapID })
			];
		})
	);

	@Effect()
	onSetLayoutFourViewsMode$: Observable<any> = this.actions$.pipe(
		ofType(MapActionTypes.SET_LAYOUT_SUCCESS),
		withLatestFrom(this.store$.select(selectFourViewsMode), this.store$.select(selectMapsIds), this.store$.select(selectFourViewsOverlays)),
		filter(([action, fourViewsMode, mapsIds, fourViewsOverlays]: [SetLayoutSuccessAction, boolean, string[], IFourViews]) => fourViewsMode),
		mergeMap(([action, fourViewsMode, mapsIds, fourViewsOverlays]: [SetLayoutSuccessAction, boolean, string[], IFourViews]) => {
			const actions = [];
			const fourViewsOverlaysKeys = Object.keys(fourViewsOverlays);

			for (let i = 0; i < 4; i++) {
				const mapId = mapsIds[i];
				const currentMapOverlays = fourViewsOverlays[fourViewsOverlaysKeys[i]];

				const mostRecentOverlay = currentMapOverlays[currentMapOverlays.length - 1];
				if (mostRecentOverlay) {
					actions.push(new DisplayOverlayAction({ overlay: mostRecentOverlay, mapId }));
				} else {
					const toastText = this.translateService.instant('Some angles are missing');
					actions.push (new SetToastMessageAction({ toastText }))
				}
			}

			return actions;
		}));

	@Effect()
	onFourViewsMode$ = this.actions$.pipe(
		ofType(MapActionTypes.SET_FOUR_VIEWS_MODE),
		filter(({ payload }: SetFourViewsModeAction) => payload?.active),
		withLatestFrom(this.store$.select(selectTime), this.store$.select(selectLayout)),
		mergeMap(([{ payload }, criteriaTime, layout]: [SetFourViewsModeAction, ICaseTimeState, string]) => {
			const sensors = payload.sensors?.length ? payload.sensors : this.overlaysService.getAllSensorsNames(true);
			criteriaTime = this.getFourViewsQueryTime(clone(criteriaTime));
			const observableOverlays = this.getFourViewsOverlays(payload.point, criteriaTime, sensors);

			return forkJoin(observableOverlays).pipe(
				mergeMap((overlaysData: any[]) => {
					const fourMapsLayout = 'layout6';
					const [firstAngleOverlays, secondAngleOverlays, thirdAngleOverlays, fourthAngleOverlays] = overlaysData.map(({ data }) => data || []);
					const fourViewsOverlays: IFourViews = {
						firstAngleOverlays,
						secondAngleOverlays,
						thirdAngleOverlays,
						fourthAngleOverlays
					};
					this.sortFourViewsOverlaysByPrioritySensor(fourViewsOverlays);
					const fourViewsLayerName = this.translateService.instant('four views coordinate');
					const fourViewsActions: Action[] = [
						new SetFourViewsOverlaysAction(fourViewsOverlays),
						new UpdateLayer({ id: regionLayerId, name: fourViewsLayerName }),
						new SetOverlaysCriteriaAction({ region: feature(payload.point), time: criteriaTime }),
						new UpdateGeoFilterStatus({ active: false, type: CaseGeoFilter.PinPoint }),
						new ToggleFooter(true),
						new UnSelectMenuItemAction()
					];

					if (layout === fourMapsLayout) {
						fourViewsActions.push(new SetLayoutSuccessAction());
					} else {
						fourViewsActions.push(new SetLayoutAction(fourMapsLayout));
					}

					return fourViewsActions;
				})
			)
		})
	);

	// measures effects
	@Effect()
	onMeasureChange$ = this.actions$.pipe(
		ofType(ToolsActionsTypes.MEASURES.CREATE_MEASURE_DATA, ToolsActionsTypes.MEASURES.REMOVE_MEASURE_DATA,
			ToolsActionsTypes.MEASURES.ADD_MEASURE, ToolsActionsTypes.MEASURES.REMOVE_MEASURE,
			ToolsActionsTypes.MEASURES.UPDATE_MEASURE_DATE_OPTIONS, ToolsActionsTypes.MEASURES.UPDATE_MEASURE_LABEL),
		concatMap(action => of(action).pipe(
			withLatestFrom(this.store$.select(selectMaps)),
		)),
		filter(([action, maps]: [
			CreateMeasureDataAction | RemoveMeasureDataAction | AddMeasureAction | RemoveMeasureAction
			| UpdateMeasureDataOptionsAction | UpdateMeasureLabelAction,
			Dictionary<IMapSettings>]) => Boolean(maps[action.payload.mapId])),
		map(([action, maps]: [
			CreateMeasureDataAction | RemoveMeasureDataAction | AddMeasureAction | RemoveMeasureAction
			| UpdateMeasureDataOptionsAction | UpdateMeasureLabelAction,
			Dictionary<IMapSettings>]) => {
			const map = maps[action.payload.mapId];
			const changes = { data: { ...map.data } };
			switch (action.type) {
				case ToolsActionsTypes.MEASURES.CREATE_MEASURE_DATA:
					const measuresData = createNewMeasureData();
					changes.data.measuresData = { ...measuresData, ...changes.data?.measuresData };
					break;
				case ToolsActionsTypes.MEASURES.REMOVE_MEASURE_DATA:
					changes.data.measuresData = { ...changes.data?.measureData, measures: [] };
					break;
				case ToolsActionsTypes.MEASURES.ADD_MEASURE:
					const oldMeasures = changes.data.measuresData.measures;
					changes.data.measuresData = {
						...changes.data.measuresData,
						measures: [...oldMeasures, action.payload.measure]
					};
					break;
				case ToolsActionsTypes.MEASURES.REMOVE_MEASURE:
					const measureId = action.payload.measureId;
					const updateMeasures = measureId ? changes.data.measuresData.measures.filter(measure => measure.id !== measureId) : [];
					changes.data.measuresData = { ...changes.data.measuresData, measures: updateMeasures };
					break;
				case ToolsActionsTypes.MEASURES.UPDATE_MEASURE_DATE_OPTIONS:
					const newOptions = action.payload.options;
					changes.data.measuresData = { ...changes.data.measuresData, ...newOptions };
					break;
				case ToolsActionsTypes.MEASURES.UPDATE_MEASURE_LABEL: {
					const { labelEntity } = action.payload;
					const lineStringId = labelEntity.featureJson.properties.feature;
					const updateMeasures = changes.data.measuresData.measures.map(measure =>
						measure.id !== lineStringId ?
							measure :
							{
								...measure,
								featureJson: {
									...measure.featureJson,
									properties: {
										...measure.featureJson.properties,
										measures: measure.featureJson.properties.measures.map(label =>
											label.id !== labelEntity.id ?
												label :
												cloneDeep(labelEntity)
										)
									}
								}
							}
					);
					changes.data.measuresData = { ...changes.data.measuresData, measures: updateMeasures };
					break;
				}
			}
			return new UpdateMapAction({ id: map.id, changes });
		}),
		rxPreventCrash()
	);

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				protected getProvidersMapsService: GetProvidersMapsService,
				@Inject(fourViewsConfig) protected fourViewsConfig: IFourViewsConfig,
				@Inject(casesConfig) protected casesConfig: ICasesConfig,
				protected translateService: TranslateService,
				protected overlaysService: OverlaysService,
				protected sourceProvider: MultipleOverlaysSourceProvider,
				@Inject(mapFacadeConfig) public config: IMapFacadeConfig,
				@Inject(overlayStatusConfig) public overlayStatusConfig: IOverlayStatusConfig,
				@Inject(ScreenViewConfig) public screenViewConfig: IScreenViewConfig
	) {
		this.lastOverlayIds = new Map();
	}

	getFourViewsQueryTime(criteriaTime: ICaseTimeState): ICaseTimeState {
		const currentYear = (new Date()).getFullYear();
		const criteriaFromYear = criteriaTime.from.getFullYear();
		if (currentYear - criteriaFromYear <  1) {
			criteriaTime.from.setFullYear(currentYear - 1);
		}

		return criteriaTime;
	}

	getFourViewsOverlays(region: Point, criteriaTime: ICaseTimeState, sensors: string[]) {
		const { registeration, resolution } = this.casesConfig.defaultCase.state.advancedSearchParameters;
		const searchParams: IFetchParams = {
			limit: this.fourViewsConfig.storageLimitPerAngle,
			sensors,
			region,
			timeRange: {
				start: criteriaTime.from,
				end: criteriaTime.to
			},
			registeration,
			resolution,
			angleParams: {
				firstAngle: 0,
				secondAngle: 89
			}
		};

		const queryOverlays = [];

		for (let i = 0; i < 4; i++) {
			queryOverlays.push(this.sourceProvider.fetch(searchParams));
			searchParams.angleParams.firstAngle += 90;
			searchParams.angleParams.secondAngle += 90;
		}

		return queryOverlays;
	}

	sortFourViewsOverlaysByPrioritySensor(fourViewsOverlays: IFourViews) {
		const fourViewsOverlaysKeys = Object.keys(fourViewsOverlays);
		fourViewsOverlaysKeys.forEach(currentAngleKey => {
			const currentAngleOverlays = fourViewsOverlays[currentAngleKey];
			this.overlaysService.sortOverlaysByPrioritySensor(currentAngleOverlays);
		});
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
		this.lastOverlayIds.set(mapId, overlay.id);
		const caseMapState = mapState.entities[payload.mapId || mapState.activeMapId];
		const mapData = caseMapState.data;
		const prevOverlay = mapData.overlay;
		const isNotIntersect = polygonsDontIntersect(mapData.position.extentPolygon, overlay.footprint, this.config.overlayCoverage);
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
				observable = from(communicator.setActiveMap(newActiveMapName, mapData.position, undefined, layer));
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

		return from(sourceLoader.createAsync(sourceProviderMetaData))
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
