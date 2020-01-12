import { Inject, Injectable } from '@angular/core';
import { Actions, Effect, ofType, createEffect } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CommunicatorEntity, ImageryCommunicatorService, IMapSettings } from '@ansyn/imagery';
import {
	ImageryCreatedAction,
	ImageryRemovedAction,
	IMapState,
	MapActionTypes,
	MapFacadeService,
	mapStateSelector,
	PinLocationModeTriggerAction,
	selectActiveMapId,
	selectMapsList,
	UpdateMapAction,
	SetLayoutAction
} from '@ansyn/map-facade';
import { Point } from 'geojson';
import { MenuActionTypes, SelectMenuItemAction } from '@ansyn/menu';
import { differenceWith, isEqual } from 'lodash';
import { filter, map, mergeMap, pluck, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { OverlayStatusActionsTypes } from '../../modules/overlays/overlay-status/actions/overlay-status.actions';
import { IAppState } from '../app.effects.module';
import { selectGeoFilterSearchMode } from '../../modules/status-bar/reducers/status-bar.reducer';
import { StatusBarActionsTypes, UpdateGeoFilterStatus } from '../../modules/status-bar/actions/status-bar.actions';
import { CasesActionTypes, SelectCaseAction } from '../../modules/menu-items/cases/actions/cases.actions';
import {
	ClearActiveInteractionsAction,
	CreateMeasureDataAction,
	DisableImageProcessing,
	EnableImageProcessing,
	GoToAction,
	RemoveMeasureDataAction,
	SetActiveCenter,
	SetActiveOverlaysFootprintModeAction,
	SetAnnotationMode,
	SetAutoImageProcessing,
	SetAutoImageProcessingSuccess,
	SetManualImageProcessing,
	SetMeasureDistanceToolState,
	SetPinLocationModeAction,
	SetSubMenu,
	ShowOverlaysFootprintAction,
	StartMouseShadow,
	StopMouseShadow,
	ToolsActionsTypes,
	UpdateMeasureDataAction,
	UpdateToolsFlags,
	PullActiveCenter
} from '../../modules/menu-items/tools/actions/tools.actions';
import { IImageProcParam, IToolsConfig, toolsConfig } from '../../modules/menu-items/tools/models/tools-config';
import {
	IToolsState,
	selectToolFlag,
	toolsFlags,
	toolsStateSelector
} from '../../modules/menu-items/tools/reducers/tools.reducer';
import { CaseGeoFilter, ICaseMapState, ImageManualProcessArgs } from '../../modules/menu-items/cases/models/case.model';
import { LoggerService } from '../../modules/core/services/logger.service';
import { selectMapsIds } from '@ansyn/map-facade';

@Injectable()
export class ToolsAppEffects {

	isPolygonSearch$ = this.store$.select(selectGeoFilterSearchMode).pipe(
		map((geoFilterSearchMode: CaseGeoFilter) => geoFilterSearchMode === CaseGeoFilter.Polygon)
	);

	activeMap$ = this.store$.pipe(
		select(mapStateSelector),
		map((mapState) => MapFacadeService.activeMap(mapState)),
		filter(Boolean)
	);

	isShadowMouseActiveByDefault = this.config.ShadowMouse && this.config.ShadowMouse.activeByDefault;

	@Effect({ dispatch: false })
	actionsLogger$: Observable<any> = this.actions$.pipe(
		ofType(
			ToolsActionsTypes.SET_AUTO_IMAGE_PROCESSING,
			ToolsActionsTypes.UPDATE_OVERLAYS_MANUAL_PROCESS_ARGS,
			ToolsActionsTypes.SET_AUTO_IMAGE_PROCESSING_SUCCESS,
			ToolsActionsTypes.SET_MANUAL_IMAGE_PROCESSING,
			ToolsActionsTypes.START_MOUSE_SHADOW,
			ToolsActionsTypes.STOP_MOUSE_SHADOW,
			ToolsActionsTypes.GO_TO,
			ToolsActionsTypes.SET_ACTIVE_OVERLAYS_FOOTPRINT_MODE,
			ToolsActionsTypes.UPDATE_TOOLS_FLAGS,
			ToolsActionsTypes.MEASURES.SET_MEASURE_TOOL_STATE,
			ToolsActionsTypes.STORE.SET_ANNOTATION_MODE,
			ToolsActionsTypes.SET_SUB_MENU
		),
		tap((action) => {
			this.loggerService.info(action.payload ? JSON.stringify(action.payload) : '', 'Tools', action.type);
		}));

	onImageriesCreated = createEffect(() => this.actions$.pipe(
		ofType(ImageryCreatedAction),
		map((payload) => {
			return CreateMeasureDataAction({ mapId: payload });
			}
		)
	));

	onImageriesRemoved = createEffect(() => this.actions$.pipe(
		ofType(ImageryRemovedAction),
		map((payload) => {
			return RemoveMeasureDataAction({ mapId: payload });
		})
	));


	drawInterrupted$ = createEffect(() => this.actions$.pipe(
		ofType<Action>(
			SelectMenuItemAction,
			SetLayoutAction,
			SetSubMenu),
		withLatestFrom(this.isPolygonSearch$),
		filter(([action, isPolygonSearch]: [any, boolean]) => isPolygonSearch),
		map(() => UpdateGeoFilterStatus())
	));

	@Effect()
	onActiveMapChangesSetOverlaysFootprintMode$: Observable<any> = this.store$.select(selectActiveMapId).pipe(
		filter(Boolean),
		withLatestFrom(this.store$.select(mapStateSelector), (activeMapId, mapState: IMapState) => MapFacadeService.activeMap(mapState)),
		filter((activeMap: ICaseMapState) => Boolean(activeMap)),
		mergeMap<any, any>((activeMap: ICaseMapState) => {
			const actions: Action[] = [SetActiveOverlaysFootprintModeAction({payload: activeMap.data.overlayDisplayMode})];
			if (!Boolean(activeMap.data.overlay)) {
				actions.push(DisableImageProcessing({}));
			}
			return actions;
		})
	);

	onShowOverlayFootprint$ = createEffect(() => this.actions$.pipe(
		ofType(ShowOverlaysFootprintAction),
		map((payload) => SetActiveOverlaysFootprintModeAction(payload)))
	);

	@Effect()
	updateImageProcessingOnTools$: Observable<any> = this.activeMap$.pipe(
		filter<any>((map) => Boolean(map.data.overlay)),
		withLatestFrom(this.store$.select(toolsStateSelector).pipe(pluck<IToolsState, ImageManualProcessArgs>('manualImageProcessingParams'))),
		mergeMap<any, any>(([map, manualImageProcessingParams]: [ICaseMapState, ImageManualProcessArgs]) => {
			const actions = [EnableImageProcessing({}),
							SetAutoImageProcessingSuccess({payload: map.data.isAutoImageProcessingActive})];
			if (!isEqual(map.data.imageManualProcessArgs, manualImageProcessingParams)) {
				actions.push(SetAutoImageProcessingSuccess({payload: map.data !=null && map.data.imageManualProcessArgs != null || this.defaultImageManualProcessArgs != null}));
			}
			return actions;
		})
	);

	backToWorldView$ = createEffect(() => this.actions$
		.pipe(
			ofType(OverlayStatusActionsTypes.BACK_TO_WORLD_VIEW),
			withLatestFrom(this.store$.select(mapStateSelector), (action, mapState: IMapState): CommunicatorEntity => this.imageryCommunicatorService.provide(mapState.activeMapId)),
			filter(communicator => Boolean(communicator)),
			map(() => DisableImageProcessing({})))
		);

	onSelectCase$ = createEffect(() => this.actions$.pipe(
		ofType(SelectCaseAction),
		map(() => DisableImageProcessing({})))
	);

	toggleAutoImageProcessing$ = createEffect(() => this.actions$.pipe(
		ofType(SetAutoImageProcessing),
		withLatestFrom(this.store$.select(mapStateSelector)),
		mergeMap<any, any>(([, mapsState]: [any, IMapState]) => {
			const activeMap: IMapSettings = MapFacadeService.activeMap(mapsState);
			const isAutoImageProcessingActive = !activeMap.data.isAutoImageProcessingActive;
			return [
				UpdateMapAction({
					id: activeMap.id,
					changes: { data: { ...activeMap.data, isAutoImageProcessingActive } }
				}),
				SetAutoImageProcessingSuccess({payload: isAutoImageProcessingActive})
			];
		}))
	);

	getActiveCenter$ = createEffect(() => this.actions$.pipe(
		ofType(PullActiveCenter),
		withLatestFrom(this.store$.select(mapStateSelector), (action, mapState: IMapState): CommunicatorEntity => this.imageryCommunicatorService.provide(mapState.activeMapId)),
		filter(communicator => Boolean(communicator)),
		mergeMap((communicator: CommunicatorEntity) => communicator.getCenter()),
		map((activeMapCenter: Point) => SetActiveCenter({payload: activeMapCenter.coordinates})))
	);

	onGoTo$ = createEffect(() => this.actions$.pipe(
		ofType(GoToAction),
		withLatestFrom(this.store$.select(mapStateSelector), (action, mapState: IMapState): any => ({
			action,
			communicator: this.imageryCommunicatorService.provide(mapState.activeMapId)
		})),
		filter(({ action, communicator }) => Boolean(communicator)),
		switchMap(({ action, communicator }) => {
			const center: Point = {
				type: 'Point',
				coordinates: action.payload
			};

			return communicator.setCenter(center).pipe(map(() => {
				return { action, communicator };
			}));
		}),
		map(({ action, communicator }) => SetActiveCenter(action.payload)))
	);

	updatePinLocationState$ = createEffect(() => this.actions$.pipe(
		ofType(SetPinLocationModeAction),
		map(({ payload }) => PinLocationModeTriggerAction(payload)))
	);

	onLayoutsChangeSetMouseShadowEnable$ = createEffect(() => this.actions$.pipe(
		ofType(SetLayoutAction),
		withLatestFrom(this.store$.select(selectMapsList), this.store$.select(selectActiveMapId), (action, mapsList: IMapSettings[], activeMapId: string) => [mapsList, activeMapId]),
		filter(([mapsList, activeMapId]) => Boolean(mapsList && mapsList.length && activeMapId)),
		withLatestFrom(this.store$.select(selectToolFlag(toolsFlags.shadowMouseActiveForManyScreens))),
		mergeMap(([[mapsList, activeMapId], shadowMouseActiveForManyScreens]: [[IMapSettings[], string], boolean]) => {
			const registredMapsCount = mapsList.reduce((count, map) => (!map.data.overlay || map.data.overlay.isGeoRegistered) ? count + 1 : count, 0);
			const activeMap = MapFacadeService.mapById(mapsList, activeMapId);
			const isActiveMapRegistred = !activeMap || (activeMap.data.overlay && !activeMap.data.overlay.isGeoRegistered);
			if (registredMapsCount < 2 || isActiveMapRegistred) {
				return [
					StopMouseShadow({}),
					UpdateToolsFlags({payload: [{ key: toolsFlags.shadowMouseDisabled, value: true }]})
				];
			}
			return [
				UpdateToolsFlags({payload: [{ key: toolsFlags.shadowMouseDisabled, value: false }]}),
				shadowMouseActiveForManyScreens ? StartMouseShadow({}) : undefined
			].filter(Boolean);
		}))
	);

	updateCaseFromTools$: Observable<any> = createEffect(() => this.actions$
		.pipe(
			ofType(ShowOverlaysFootprintAction),
			withLatestFrom(this.store$.select(mapStateSelector)),
			map(([payload, mapState]: [any, IMapState]) => {
				const activeMap = MapFacadeService.activeMap(mapState);
				activeMap.data.overlayDisplayMode = payload;
				return UpdateMapAction({
					id: activeMap.id, changes: {
						data: { ...activeMap.data, overlayDisplayMode: payload }
					}
				});
			})
		)
	);

	clearActiveInteractions$ = createEffect(() => this.actions$.pipe(
		ofType(ClearActiveInteractionsAction),
		withLatestFrom(this.store$.select(selectMapsIds)),
		mergeMap(([{payload}, mapIds]: [any, string[]]) => {
			// reset the following interactions: Annotation, Pinpoint search, Pin location
			let clearActions: Action[] = [
				SetAnnotationMode(null),
				UpdateGeoFilterStatus(),
				SetPinLocationModeAction({payload: false})
			];
			// set measure tool as inactive
			mapIds.forEach((mapId) => {
				const updateMeasureAction = UpdateMeasureDataAction({
					mapId: mapId,
					measureData: { isToolActive: false }
				});
				clearActions.push(updateMeasureAction);
			});
			// return defaultClearActions without skipClearFor
			if (payload && payload.skipClearFor) {
				clearActions = differenceWith(clearActions, payload.skipClearFor,
					(act, actType) => act instanceof actType);
			}
			return clearActions;
		}))
	);

	onCloseGoTo$ = createEffect(() => this.actions$.pipe(
		ofType(SetSubMenu),
		filter(payload => Boolean(!payload)),
		map(() => SetPinLocationModeAction({payload: false}))
	));

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(toolsConfig) protected config: IToolsConfig,
				protected loggerService: LoggerService) {
	}

	get params(): Array<IImageProcParam> {
		return this.config.ImageProcParams;
	}

	get defaultImageManualProcessArgs(): ImageManualProcessArgs {
		return this.params.reduce<ImageManualProcessArgs>((initialObject: any, imageProcParam) => {
			return <any>{ ...initialObject, [imageProcParam.name]: imageProcParam.defaultValue };
		}, {});
	}
}
