import { Inject, Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { CommunicatorEntity, ImageryCommunicatorService, IMapSettings } from '@ansyn/imagery';
import {
	IMapState, MapActionTypes,
	MapFacadeService,
	mapStateSelector,
	PinLocationModeTriggerAction,
	selectActiveMapId,
	selectMapsList,
	UpdateMapAction
} from '@ansyn/map-facade';
import { Point } from 'geojson';
import { MenuActionTypes, SelectMenuItemAction } from '@ansyn/menu';
import { differenceWith, isEqual } from 'lodash';
import { filter, map, mergeMap, pluck, switchMap, withLatestFrom } from 'rxjs/operators';
import { OverlayStatusActionsTypes } from '../../modules/overlays/overlay-status/actions/overlay-status.actions';
import { IAppState } from '../app.effects.module';
import { selectGeoFilterSearchMode } from '../../modules/status-bar/reducers/status-bar.reducer';
import { StatusBarActionsTypes, UpdateGeoFilterStatus } from '../../modules/status-bar/actions/status-bar.actions';
import { CasesActionTypes } from '../../modules/menu-items/cases/actions/cases.actions';
import {
	ClearActiveInteractionsAction,
	DisableImageProcessing,
	EnableImageProcessing,
	GoToAction,
	SetActiveCenter,
	SetActiveOverlaysFootprintModeAction,
	SetAnnotationMode,
	SetAutoImageProcessing,
	SetAutoImageProcessingSuccess,
	SetManualImageProcessing,
	SetMeasureDistanceToolState,
	SetPinLocationModeAction, SetSubMenu,
	ShowOverlaysFootprintAction, StartMouseShadow, StopMouseShadow, ToolsActionsTypes, UpdateToolsFlags
} from '../../modules/menu-items/tools/actions/tools.actions';
import { IImageProcParam, IToolsConfig, toolsConfig } from '../../modules/menu-items/tools/models/tools-config';
import {
	IToolsState,
	selectToolFlag,
	toolsFlags,
	toolsStateSelector
} from '../../modules/menu-items/tools/reducers/tools.reducer';
import { CaseGeoFilter, ICaseMapState, ImageManualProcessArgs } from '../../modules/menu-items/cases/models/case.model';

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

	get params(): Array<IImageProcParam> {
		return this.config.ImageProcParams;
	}

	get defaultImageManualProcessArgs(): ImageManualProcessArgs {
		return this.params.reduce<ImageManualProcessArgs>((initialObject: any, imageProcParam) => {
			return <any>{ ...initialObject, [imageProcParam.name]: imageProcParam.defaultValue };
		}, {});
	}

	@Effect()
	drawInterrupted$: Observable<any> = this.actions$.pipe(
		ofType<Action>(
			MenuActionTypes.SELECT_MENU_ITEM,
			StatusBarActionsTypes.SET_COMBOBOXES_PROPERTIES,
			MapActionTypes.SET_LAYOUT,
			ToolsActionsTypes.SET_SUB_MENU),
		withLatestFrom(this.isPolygonSearch$),
		filter(([action, isPolygonSearch]: [SelectMenuItemAction, boolean]) => isPolygonSearch),
		map(() => new UpdateGeoFilterStatus())
	);

	@Effect()
	onActiveMapChangesSetOverlaysFootprintMode$: Observable<any> = this.store$.select(selectActiveMapId).pipe(
		filter(Boolean),
		withLatestFrom(this.store$.select(mapStateSelector), (activeMapId, mapState: IMapState) => MapFacadeService.activeMap(mapState)),
		filter((activeMap: ICaseMapState) => Boolean(activeMap)),
		mergeMap<any, any>((activeMap: ICaseMapState) => {
			const actions: Action[] = [new SetActiveOverlaysFootprintModeAction(activeMap.data.overlayDisplayMode)];
			if (!Boolean(activeMap.data.overlay)) {
				actions.push(new DisableImageProcessing());
			}
			return actions;
		})
	);


	@Effect()
	onShowOverlayFootprint$: Observable<any> = this.actions$.pipe(
		ofType<ShowOverlaysFootprintAction>(ToolsActionsTypes.SHOW_OVERLAYS_FOOTPRINT),
		map((action) => new SetActiveOverlaysFootprintModeAction(action.payload))
	);

	@Effect()
	updateImageProcessingOnTools$: Observable<any> = this.activeMap$.pipe(
		filter((map) => Boolean(map.data.overlay)),
		withLatestFrom(this.store$.select(toolsStateSelector).pipe(pluck<IToolsState, ImageManualProcessArgs>('manualImageProcessingParams'))),
		mergeMap<any, any>(([map, manualImageProcessingParams]: [ICaseMapState, ImageManualProcessArgs]) => {
			const actions = [new EnableImageProcessing(), new SetAutoImageProcessingSuccess(map.data.isAutoImageProcessingActive)];
			if (!isEqual(map.data.imageManualProcessArgs, manualImageProcessingParams)) {
				actions.push(new SetManualImageProcessing(map.data && map.data.imageManualProcessArgs || this.defaultImageManualProcessArgs));
			}
			return actions;
		})
	);

	@Effect()
	backToWorldView$: Observable<DisableImageProcessing> = this.actions$
		.pipe(
			ofType(OverlayStatusActionsTypes.BACK_TO_WORLD_VIEW),
			withLatestFrom(this.store$.select(mapStateSelector), (action, mapState: IMapState): CommunicatorEntity => this.imageryCommunicatorService.provide(mapState.activeMapId)),
			filter(communicator => Boolean(communicator)),
			map(() => new DisableImageProcessing())
		);

	@Effect()
	onSelectCase$: Observable<DisableImageProcessing> = this.actions$.pipe(
		ofType(CasesActionTypes.SELECT_CASE),
		map(() => new DisableImageProcessing()));

	@Effect()
	toggleAutoImageProcessing$: Observable<any> = this.actions$.pipe(
		ofType(ToolsActionsTypes.SET_AUTO_IMAGE_PROCESSING),
		withLatestFrom(this.store$.select(mapStateSelector)),
		mergeMap<any, any>(([action, mapsState]: [SetAutoImageProcessing, IMapState]) => {
			const activeMap: IMapSettings = MapFacadeService.activeMap(mapsState);
			const isAutoImageProcessingActive = !activeMap.data.isAutoImageProcessingActive;
			return [
				new UpdateMapAction({
					id: activeMap.id,
					changes: { data: { ...activeMap.data, isAutoImageProcessingActive } }
				}),
				new SetAutoImageProcessingSuccess(isAutoImageProcessingActive)
			];
		})
	);

	@Effect()
	getActiveCenter$: Observable<SetActiveCenter> = this.actions$.pipe(
		ofType(ToolsActionsTypes.PULL_ACTIVE_CENTER),
		withLatestFrom(this.store$.select(mapStateSelector), (action, mapState: IMapState): CommunicatorEntity => this.imageryCommunicatorService.provide(mapState.activeMapId)),
		filter(communicator => Boolean(communicator)),
		mergeMap((communicator: CommunicatorEntity) => communicator.getCenter()),
		map((activeMapCenter: Point) => new SetActiveCenter(activeMapCenter.coordinates)));

	@Effect()
	onGoTo$: Observable<SetActiveCenter> = this.actions$.pipe(
		ofType<GoToAction>(ToolsActionsTypes.GO_TO),
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
		map(({ action, communicator }) => new SetActiveCenter(action.payload)));

	@Effect()
	updatePinLocationState$: Observable<PinLocationModeTriggerAction> = this.actions$.pipe(
		ofType<SetPinLocationModeAction>(ToolsActionsTypes.SET_PIN_LOCATION_MODE),
		map(({ payload }) => new PinLocationModeTriggerAction(payload)));

	@Effect()
	onLayoutsChangeSetMouseShadowEnable$: Observable<any> = combineLatest(this.store$.select(selectMapsList), this.store$.select(selectActiveMapId)).pipe(
		filter(([mapsList, activeMapId]) => Boolean(mapsList.length && activeMapId)),
		withLatestFrom(this.store$.select(selectToolFlag(toolsFlags.shadowMouseActiveForManyScreens))),
		mergeMap(([[mapsList, activeMapId], shadowMouseActiveForManyScreens]) => {
			const registredMapsCount = mapsList.reduce((count, map) => (!map.data.overlay || map.data.overlay.isGeoRegistered) ? count + 1 : count, 0);
			const activeMap = MapFacadeService.mapById(mapsList, activeMapId);
			const isActiveMapRegistred = !activeMap || (activeMap.data.overlay && !activeMap.data.overlay.isGeoRegistered);
			if (registredMapsCount < 2 || isActiveMapRegistred) {
				return [
					new StopMouseShadow(),
					new UpdateToolsFlags([{ key: toolsFlags.shadowMouseDisabled, value: true }])
				];
			}
			return [
				new UpdateToolsFlags([{ key: toolsFlags.shadowMouseDisabled, value: false }]),
				shadowMouseActiveForManyScreens ? new StartMouseShadow() : undefined
			].filter(Boolean);
		}));

	@Effect()
	updateCaseFromTools$: Observable<any> = this.actions$
		.pipe(
			ofType<ShowOverlaysFootprintAction>(ToolsActionsTypes.SHOW_OVERLAYS_FOOTPRINT),
			withLatestFrom(this.store$.select(mapStateSelector)),
			map(([action, mapState]: [ShowOverlaysFootprintAction, IMapState]) => {
				const activeMap = MapFacadeService.activeMap(mapState);
				activeMap.data.overlayDisplayMode = action.payload;
				return new UpdateMapAction({
					id: activeMap.id, changes: {
						data: { ...activeMap.data, overlayDisplayMode: action.payload }
					}
				});
			})
		);

	@Effect()
	clearActiveInteractions$ = this.actions$.pipe(
		ofType<ClearActiveInteractionsAction>(ToolsActionsTypes.CLEAR_ACTIVE_TOOLS),
		mergeMap(action => {
			// reset the following interactions: Measure Distance, Annotation, Pinpoint search, Pin location
			let clearActions = [
				new SetMeasureDistanceToolState(false),
				new SetAnnotationMode(),
				new UpdateGeoFilterStatus(),
				new SetPinLocationModeAction(false)
			];
			// return defaultClearActions without skipClearFor
			if (action.payload && action.payload.skipClearFor) {
				clearActions = differenceWith(clearActions, action.payload.skipClearFor,
					(act, actType) => act instanceof actType);
			}
			return clearActions;
		}));

	@Effect()
	onCloseGoTo$ = this.actions$.pipe(
		ofType<SetSubMenu>(ToolsActionsTypes.SET_SUB_MENU),
		filter( action => Boolean(!action.payload)),
		map( () => new SetPinLocationModeAction(false))
	);

	constructor(protected actions$: Actions, protected store$: Store<IAppState>, protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(toolsConfig) protected config: IToolsConfig) {
	}
}
