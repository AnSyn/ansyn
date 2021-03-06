import { Inject, Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action, Store, select } from '@ngrx/store';
import { Observable, of } from 'rxjs';
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
	selectMapsIds,
	selectMapsList
} from '@ansyn/map-facade';
import { Point } from 'geojson';
import { differenceWith, isEqual } from 'lodash';
import { filter, map, mergeMap, switchMap, withLatestFrom, concatMap, tap, distinctUntilChanged } from 'rxjs/operators';
import { IAppState } from '../app.effects.module';
import { UpdateGeoFilterStatus } from '../../modules/status-bar/actions/status-bar.actions';
import {
	ClearActiveInteractionsAction,
	CreateMeasureDataAction,
	GoToAction,
	RemoveMeasureDataAction,
	SetActiveCenter,
	SetAnnotationMode,
	SetPinLocationModeAction,
	SetSubMenu,
	StartMouseShadow,
	StopMouseShadow,
	ToolsActionsTypes, UpdateMeasureDataOptionsAction,
	UpdateToolsFlags
} from '../../modules/status-bar/components/tools/actions/tools.actions';
import { IToolsConfig, toolsConfig } from '../../modules/status-bar/components/tools/models/tools-config';
import {
	selectAnnotationMode,
	selectIsMeasureToolActive,
	selectToolFlag
} from '../../modules/status-bar/components/tools/reducers/tools.reducer';
import { toolsFlags } from '../../modules/status-bar/components/tools/models/tools.model';
import { OverlayStatusActionsTypes } from '../../modules/overlays/overlay-status/actions/overlay-status.actions';

@Injectable()
export class ToolsAppEffects {

	@Effect()
	onMeasureToolChange: Observable<any> = this.actions$.pipe(
		ofType(MapActionTypes.SET_ACTIVE_MAP_ID, ToolsActionsTypes.UPDATE_TOOLS_FLAGS),
		concatMap( action => of(action).pipe(
			withLatestFrom(this.store$.pipe(select(selectMapsIds)), this.store$.pipe(select(selectIsMeasureToolActive)), ( _, mapIds, measureIsActive) => [mapIds, measureIsActive])
		)),
		distinctUntilChanged(isEqual),
		filter( ([mapIds, isActive]: [string[], boolean]) => isActive !== undefined),
		mergeMap( ([mapIds, isActive]: [string[], boolean]) =>
			mapIds.map( (mapId) => isActive ? new CreateMeasureDataAction({ mapId })
			: new RemoveMeasureDataAction({ mapId })))
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
		withLatestFrom(this.store$.select(mapStateSelector), (action: GoToAction, mapState: IMapState): any => ({
			action,
			communicator: this.imageryCommunicatorService.provide(action.mapId ? action.mapId : mapState.activeMapId)
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
	onLayoutsChangeSetMouseShadowEnable$: Observable<any> = this.actions$.pipe(
		ofType(MapActionTypes.SET_LAYOUT),
		withLatestFrom(this.store$.select(selectMapsList), this.store$.select(selectActiveMapId), (action, mapsList: IMapSettings[], activeMapId: string) => [mapsList, activeMapId]),
		filter(([mapsList, activeMapId]) => Boolean(mapsList && mapsList.length && activeMapId)),
		withLatestFrom(this.store$.select(selectToolFlag(toolsFlags.shadowMouseActiveForManyScreens)), this.store$.select(selectToolFlag(toolsFlags.forceShadowMouse))),
		mergeMap(([[mapsList, activeMapId], shadowMouseActiveForManyScreens, forceShadowMouse]: [[IMapSettings[], string], boolean, boolean]) => {
			const registredMapsCount = mapsList.reduce((count, map) => (!map.data.overlay || map.data.overlay.isGeoRegistered) ? count + 1 : count, 0);
			forceShadowMouse = forceShadowMouse === undefined ? (this.config && this.config.ShadowMouse.forceSendShadowMousePosition) : forceShadowMouse;
			const activeMap = MapFacadeService.mapById(mapsList, activeMapId);
			const isActiveMapRegistred = !activeMap || (activeMap.data.overlay && !activeMap.data.overlay.isGeoRegistered);
			if ((registredMapsCount < 2 || isActiveMapRegistred) && !forceShadowMouse) {
				return [
					new StopMouseShadow(),
					new UpdateToolsFlags([{ key: toolsFlags.shadowMouseDisabled, value: true }])
				];
			}
			return [
				new UpdateToolsFlags([{ key: toolsFlags.shadowMouseDisabled, value: false }]),
				shadowMouseActiveForManyScreens || forceShadowMouse ? new StartMouseShadow() : undefined
			].filter(Boolean);
		}));

	@Effect()
	clearActiveInteractions$ = this.actions$.pipe(
		ofType<ClearActiveInteractionsAction>(ToolsActionsTypes.CLEAR_ACTIVE_TOOLS),
		withLatestFrom(this.store$.select(selectMapsIds)),
		mergeMap(([action, mapIds]: [ClearActiveInteractionsAction, string[]]) => {
			// reset the following interactions: Annotation, Pinpoint search, Pin location
			let clearActions: Action[] = [
				new SetAnnotationMode(null),
				new UpdateGeoFilterStatus(),
				new SetPinLocationModeAction(false)
			];
			// set measure tool as inactive
			mapIds.forEach((mapId) => {
				const updateMeasureAction = new UpdateMeasureDataOptionsAction({
					mapId: mapId,
					options: { isToolActive: false, isRemoveMeasureModeActive: false}
				});
				clearActions.push(updateMeasureAction);
			});
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
		filter(action => Boolean(!action.payload)),
		map(() => new SetPinLocationModeAction(false))
	);

	@Effect()
	drawInterrupted$ = this.actions$.pipe(
		ofType(MapActionTypes.TRIGGER.CLICK_OUTSIDE_MAP,
			OverlayStatusActionsTypes.BACK_TO_WORLD_VIEW,
			),
		filter((this.isNotFromAnnotationControl.bind(this))),
		withLatestFrom(this.store$.pipe(select(selectAnnotationMode))),
		filter(([action, mode]) => Boolean(mode)),
		map( () => new SetAnnotationMode(null))
	);

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(toolsConfig) protected config: IToolsConfig) {
	}


	private isNotFromAnnotationControl(action) {
		if (action.type === MapActionTypes.TRIGGER.CLICK_OUTSIDE_MAP) {
			// prevent disable from first click
			const event: MouseEvent = action.payload;
			return !event.composedPath().some( (target: any) => target.localName === 'ansyn-annotations-control');
		}
		return true;
	}
}
