import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { IAppState } from '../';
import {
	DisableImageProcessing,
	EnableImageProcessing,
	SetActiveCenter,
	SetAutoImageProcessing,
	SetAutoImageProcessingSuccess,
	ToolsActionsTypes
} from '@ansyn/menu-items/tools';
import { CasesActionTypes } from '@ansyn/menu-items/cases';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import 'rxjs/add/operator/withLatestFrom';
import { cloneDeep } from 'lodash';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import {
	DisableMouseShadow,
	EnableMouseShadow,
	GoToAction,
	SetActiveOverlaysFootprintModeAction,
	SetManualImageProcessing,
	SetManualImageProcessingArguments,
	SetManualImageProcessingSuccess,
	SetPinLocationModeAction,
	ShowOverlaysFootprintAction,
	StopMouseShadow
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { ActiveMapChangedAction, MapActionTypes, SetMapAutoImageProcessing } from '@ansyn/map-facade';
import { DisplayOverlaySuccessAction, OverlaysActionTypes } from '@ansyn/overlays';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import {
	AnnotationRemoveFeature,
	PinLocationModeTriggerAction,
	SetMapManualImageProcessing,
	SetMapsDataActionStore
} from '@ansyn/map-facade/actions/map.actions';
import { Case, CaseMapState } from '@ansyn/core/models/case.model';

import { ILayerState, layersStateSelector } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { casesStateSelector, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import {
	CoreActionTypes, ImageManualProcessArgs, layoutOptions,
	SetLayoutAction
} from '@ansyn/core';
import { SetAnnotationsLayer } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { Feature, FeatureCollection } from 'geojson';
import { SetSubMenu, SubMenuEnum } from '@ansyn/menu-items';
import {
	IStatusBarState,
	StatusBarActionsTypes,
	statusBarFlagsItemsEnum,
	statusBarStateSelector,
	UpdateStatusFlagsAction
} from '@ansyn/status-bar';
import { MenuActionTypes, SelectMenuItemAction } from '@ansyn/menu';


@Injectable()
export class ToolsAppEffects {
	layersState$ = this.store$.select(layersStateSelector);

	flags$ = this.store$.select(statusBarStateSelector)
		.pluck<IStatusBarState, Map<statusBarFlagsItemsEnum, boolean>>('flags')
		.distinctUntilChanged();

	isPolygonSearch$ = this.flags$
		.map((flags) => flags.get(statusBarFlagsItemsEnum.polygonSearch))
		.distinctUntilChanged();


	/**
	 * @type Effect
	 * @name drawInterrupted$
	 * @ofType Action
	 * @dependencies map
	 * @filter check if polygon draw interrupted
	 * @action UpdateStatusFlagsAction?
	 */
	@Effect()
	drawInterrupted$: Observable<any> = this.actions$
		.ofType<Action>(
			MenuActionTypes.SELECT_MENU_ITEM,
			StatusBarActionsTypes.SET_COMBOBOXES_PROPERTIES,
			CoreActionTypes.SET_LAYOUT,
			OverlaysActionTypes.SELECT_OVERLAY)
		.withLatestFrom(this.isPolygonSearch$)
		.filter(([action, isPolygonSearch]: [SelectMenuItemAction, boolean]) => isPolygonSearch)
		.map(() => new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.polygonSearch, value: false }));

	/**
	 * @type Effect
	 * @name onSetSubMenu$
	 * @ofType SetSubMenu
	 * @dependencies map
	 * @filter SubMenu not null or undefined
	 * @action UpdateStatusFlagsAction?
	 */
	@Effect()
	onSetSubMenu$: Observable<any> = this.actions$
		.ofType<SetSubMenu>(ToolsActionsTypes.SET_SUB_MENU)
		.map(({ payload }) => payload)
		.filter(Boolean)
		.map(() =>  new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.polygonSearch, value: false }));

	/**
	 * @type Effect
	 * @name onActiveMapChanges$
	 * @ofType ActiveMapChangedAction
	 * @dependencies map
	 * @filter There is an active map
	 * @action DisableImageProcessing?, EnableImageProcessing?, SetAutoImageProcessingSuccess?
	 */
	@Effect()
	onManualDataChange$: Observable<SetManualImageProcessingSuccess> = this.actions$
		.ofType(MapActionTypes.SET_MAP_MANUAL_IMAGE_PROCESSING)
		.map((action: SetMapManualImageProcessing) => {
			return new SetManualImageProcessingSuccess(action.payload);
		});


	/**
	 * @type Effect
	 * @name onActiveMapChanges$
	 * @ofType ActiveMapChangedAction
	 * @dependencies map
	 * @filter There is an active map
	 * @action DisableImageProcessing?, EnableImageProcessing?, SetAutoImageProcessingSuccess?
	 */
	@Effect()
	onActiveMapChanges$: Observable<ActiveMapChangedAction | DisableImageProcessing | SetAutoImageProcessingSuccess> = this.actions$
		.ofType(MapActionTypes.TRIGGER.ACTIVE_MAP_CHANGED)
		.withLatestFrom(this.store$.select(mapStateSelector), (action, mapState: IMapState) => mapState)
		.map(MapFacadeService.activeMap)
		.filter(activeMap => Boolean(activeMap))
		.mergeMap((activeMap: CaseMapState) => {
			if (!activeMap.data.overlay) {
				return [new DisableImageProcessing()];
			} else {
				return [
					new EnableImageProcessing(),
					new SetAutoImageProcessingSuccess(activeMap.data.isAutoImageProcessingActive)
				];
			}
		});


	/**
	 * @type Effect
	 * @name onActiveMapChangesSetOverlaysFootprintMode$
	 * @ofType ActiveMapChangedAction
	 * @dependencies map
	 * @action SetActiveOverlaysFootprintModeAction
	 */
	@Effect()
	onActiveMapChangesSetOverlaysFootprintMode$: Observable<any> = this.actions$
		.ofType(MapActionTypes.TRIGGER.ACTIVE_MAP_CHANGED)
		.withLatestFrom(this.store$.select(mapStateSelector), (action, mapState: IMapState) => MapFacadeService.activeMap(mapState))
		.map((activeMap: CaseMapState) => new SetActiveOverlaysFootprintModeAction(activeMap.data.overlayDisplayMode));

	/**
	 * @type Effect
	 * @name onShowOverlayFootprint$
	 * @ofType ShowOverlaysFootprintAction
	 * @action SetActiveOverlaysFootprintModeAction
	 */
	@Effect()
	onShowOverlayFootprint$: Observable<any> = this.actions$
		.ofType<ShowOverlaysFootprintAction>(ToolsActionsTypes.SHOW_OVERLAYS_FOOTPRINT)
		.map((action) => new SetActiveOverlaysFootprintModeAction(action.payload));

	/**
	 * @type Effect
	 * @name onDisplayOverlaySuccess$
	 * @ofType DisplayOverlaySuccessAction
	 * @dependencies map
	 * @action EnableImageProcessing, SetMapAutoImageProcessing?, SetMapManualImageProcessing?, SetManualImageProcessingArguments, SetAutoImageProcessingSuccess
	 */

	@Effect()
	onDisplayOverlaySuccess$: Observable<any> = this.actions$
		.ofType<DisplayOverlaySuccessAction>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS)
		.withLatestFrom(this.store$.select(casesStateSelector), this.store$.select(mapStateSelector),
			(action: DisplayOverlaySuccessAction, cases: ICasesState, mapsState: IMapState) => {
				const mapId = action.payload.mapId || mapsState.activeMapId;
				const selectedMap: CaseMapState = MapFacadeService.mapById(mapsState.mapsList, mapId);
				return [action, selectedMap, cloneDeep(cases.selectedCase)];
			})
		.filter(([action, selectedMap, selectedCase]: [DisplayOverlaySuccessAction, CaseMapState, Case]) => Boolean(selectedMap))
		.mergeMap(([action, selectedMap, selectedCase]: [DisplayOverlaySuccessAction, CaseMapState, Case]) => {
			// action 1: EnableImageProcessing
			const actions = [new EnableImageProcessing()];
			let manualProcessArgs;

			// action 2: SetMapManualImageProcessing / SetMapAutoImageProcessing (optional)
			if (selectedCase.state.overlaysManualProcessArgs) {
				manualProcessArgs = selectedCase.state.overlaysManualProcessArgs[action.payload.overlay.id];
			}
			if (selectedMap.data.isAutoImageProcessingActive) {
				// auto process action
				actions.push(new SetMapAutoImageProcessing({
					mapId: selectedMap.id,
					toggleValue: selectedMap.data.isAutoImageProcessingActive
				}));
			} else if (manualProcessArgs) {
				// manual process action
				actions.push(new SetMapManualImageProcessing({
					mapId: selectedMap.id,
					processingParams: manualProcessArgs
				}));
			}
			// action 3: update Manual Image Processing Arguments
			actions.push(new SetManualImageProcessingArguments({ processingParams: manualProcessArgs }));

			// action 4: SetAutoImageProcessingSuccess (autoImageProcessing / manualImageProcessing / null)
			actions.push(new SetAutoImageProcessingSuccess(selectedMap.data.isAutoImageProcessingActive));
			return actions;
		});

	/**
	 * @type Effect
	 * @name backToWorldView$
	 * @ofType BackToWorldAction
	 * @action DisableImageProcessing
	 */
	@Effect()
	backToWorldView$: Observable<DisableImageProcessing> = this.actions$
		.ofType(CoreActionTypes.BACK_TO_WORLD_VIEW)
		.map(() => new DisableImageProcessing());

	/**
	 * @type Effect
	 * @name onSelectCase$
	 * @ofType SelectCaseAction
	 * @action DisableImageProcessing
	 */
	@Effect()
	onSelectCase$: Observable<DisableImageProcessing> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.map(() => new DisableImageProcessing());

	/**
	 * @type Effect
	 * @name toggleAutoImageProcessing$
	 * @ofType SetAutoImageProcessing
	 * @dependencies map
	 * @action SetMapAutoImageProcessing, SetMapsDataActionStore, SetAutoImageProcessingSuccess
	 */
	@Effect()
	toggleAutoImageProcessing$: Observable<any> = this.actions$
		.ofType(ToolsActionsTypes.SET_AUTO_IMAGE_PROCESSING)
		.withLatestFrom(this.store$.select(mapStateSelector), (action: SetAutoImageProcessing, mapsState: IMapState) => {
			return [action, mapsState];
		})
		.mergeMap(([action, mapsState]: [SetAutoImageProcessing, IMapState]) => {
			mapsState = updatesMapAutoImageProcessingFlag(mapsState, true);
			const activeMap: CaseMapState = MapFacadeService.activeMap(mapsState);

			return [
				new SetMapAutoImageProcessing({
					mapId: mapsState.activeMapId,
					toggleValue: activeMap.data.isAutoImageProcessingActive
				}),
				new SetMapsDataActionStore({ mapsList: [...mapsState.mapsList] }),
				new SetAutoImageProcessingSuccess(activeMap.data.isAutoImageProcessingActive)
			];
		});

	/**
	 * @type Effect
	 * @name resetManualImageProcessingArguments$
	 * @ofType SetAutoImageProcessing
	 * @dependencies withLatestFrom, filter, map
	 * @action UpdateCaseAction, SetManualImageProcessingArguments
	 */
	@Effect()
	resetManualImageProcessingArguments$: Observable<any> = this.actions$
		.ofType(ToolsActionsTypes.SET_AUTO_IMAGE_PROCESSING, OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS)
		.withLatestFrom(this.store$.select(casesStateSelector), this.store$.select(mapStateSelector))
		.map(([action, cases, mapsState]: [DisplayOverlaySuccessAction, ICasesState, IMapState]) => {
			const mapId = (action.payload && action.payload.mapId) || mapsState.activeMapId;
			const selectedMap: CaseMapState = MapFacadeService.mapById(mapsState.mapsList, mapId);
			return [selectedMap, cloneDeep(cases.selectedCase)];
		})
		.filter(([selectedMap]: [CaseMapState, Case]) => Boolean(selectedMap) && Boolean(selectedMap.data.overlay))
		.filter(([selectedMap, selectedCase]: [CaseMapState, Case]) => {
			const overlayId = selectedMap.data.overlay.id;
			const isAutoProcessOn = selectedMap.data.isAutoImageProcessingActive;
			const ManualProcessArgs = selectedCase.state.overlaysManualProcessArgs;
			return Boolean(isAutoProcessOn && ManualProcessArgs && ManualProcessArgs[overlayId]);
		})
		.mergeMap(([activeMap, selectedCase]: [CaseMapState, Case]) => {
			const overlayId = activeMap.data.overlay.id;
			selectedCase = updateOverlaysManualProcessArgs(selectedCase, overlayId, null);
			return [
				new SetManualImageProcessingArguments({ processingParams: undefined }),
				new UpdateCaseAction(selectedCase)
			];
		});


	/**
	 * @type Effect
	 * @name onManualImageProcessing$
	 * @ofType SetManualImageProcessing
	 * @filter There is a active map
	 * @dependencies map, withLatestFrom
	 * @action UpdateCaseAction, SetMapsDataActionStore, SetMapManualImageProcessing
	 */
	@Effect()
	onManualImageProcessing$: Observable<any> = this.actions$
		.ofType(ToolsActionsTypes.SET_MANUAL_IMAGE_PROCESSING)
		.withLatestFrom(this.store$.select(casesStateSelector), this.store$.select(mapStateSelector))
		.mergeMap(([action, cases, mapsState]: [SetManualImageProcessing, ICasesState, IMapState]) => {
			const activeMap: CaseMapState = MapFacadeService.activeMap(mapsState);
			let selectedCase = cloneDeep(cases.selectedCase);
			// @todo remove this!
			if (!activeMap.data.overlay) {
				return Observable.empty();
			}
			selectedCase = updateOverlaysManualProcessArgs(selectedCase, activeMap.data.overlay.id, action.payload.processingParams);
			mapsState = updatesMapAutoImageProcessingFlag(mapsState, false, false);
			return [
				new UpdateCaseAction(selectedCase),
				new SetMapsDataActionStore({ mapsList: [...mapsState.mapsList] }),
				new SetMapManualImageProcessing({
					mapId: mapsState.activeMapId,
					processingParams: action.payload.processingParams
				})
			];
		});

	/**
	 * @type Effect
	 * @name getActiveCenter$
	 * @ofType PullActiveCenter
	 * @dependencies map
	 * @filter There is a map communicator
	 * @action SetActiveCenter
	 */
	@Effect()
	getActiveCenter$: Observable<SetActiveCenter> = this.actions$
		.ofType(ToolsActionsTypes.PULL_ACTIVE_CENTER)
		.withLatestFrom(this.store$.select(mapStateSelector), (action, mapState: IMapState): CommunicatorEntity => this.imageryCommunicatorService.provide(mapState.activeMapId))
		.filter(communicator => Boolean(communicator))
		.mergeMap((communicator: CommunicatorEntity) => communicator.getCenter())
		.map((activeMapCenter: GeoJSON.Point) => new SetActiveCenter(activeMapCenter.coordinates));

	/**
	 * @type Effect
	 * @name onGoTo$
	 * @ofType GoToAction
	 * @dependencies map
	 * @filter There is a map communicator
	 * @action SetActiveCenter
	 */
	@Effect()
	onGoTo$: Observable<SetActiveCenter> = this.actions$
		.ofType<GoToAction>(ToolsActionsTypes.GO_TO)
		.withLatestFrom(this.store$.select(mapStateSelector), (action, mapState: IMapState): any => ({
			action,
			communicator: this.imageryCommunicatorService.provide(mapState.activeMapId)
		}))
		.filter(({ action, communicator }) => Boolean(communicator))
		.switchMap(({ action, communicator }) => {
			const center: GeoJSON.Point = {
				type: 'Point',
				coordinates: action.payload
			};

			return communicator.setCenter(center).map(() => { return { action, communicator } });
		})
		.map(({ action, communicator }) => new SetActiveCenter(action.payload));

	/**
	 * @type Effect
	 * @name updatePinLocationState$
	 * @ofType SetPinLocationModeAction
	 * @action PinLocationModeTriggerAction
	 */
	@Effect()
	updatePinLocationState$: Observable<PinLocationModeTriggerAction> = this.actions$
		.ofType<SetPinLocationModeAction>(ToolsActionsTypes.SET_PIN_LOCATION_MODE)
		.map(({ payload }) => new PinLocationModeTriggerAction(payload));

	/**
	 * @type Effect
	 * @name onLayoutsChangeSetMouseShadowEnable$
	 * @ofType SetLayoutAction
	 * @action DisableMouseShadow?, StopMouseShadow?, EnableMouseShadow?
	 */
	@Effect()
	onLayoutsChangeSetMouseShadowEnable$: Observable<any> = this.actions$
		.ofType<SetLayoutAction>(CoreActionTypes.SET_LAYOUT)
		.mergeMap(({ payload }) => {
			const { mapsCount } = layoutOptions.get(payload);
			if (mapsCount === 1) {
				return [
					new DisableMouseShadow(),
					new StopMouseShadow()
				];
			}
			return [new EnableMouseShadow()];
		});

	/**
	 * @type Effect
	 * @name removeFeature$
	 * @ofType AnnotationRemoveFeature
	 * @dependencies layers
	 * @action SetAnnotationsLayer
	 */
	@Effect()
	removeAnnotationFeature$: Observable<SetAnnotationsLayer> = this.actions$
		.ofType<AnnotationRemoveFeature>(MapActionTypes.TRIGGER.ANNOTATION_REMOVE_FEATURE)
		.withLatestFrom(this.layersState$)
		.map(([action, layerState]: [AnnotationRemoveFeature, ILayerState]) => {
			const updatedAnnotationsLayer = <FeatureCollection<any>> { ...layerState.annotationsLayer };
			const featureIndex = updatedAnnotationsLayer.features.findIndex((feature: Feature<any>) => {
				return feature.properties.id === action.payload;
			});
			updatedAnnotationsLayer.features.splice(featureIndex, 1);
			return new SetAnnotationsLayer(updatedAnnotationsLayer);
		});

	constructor(protected actions$: Actions, protected store$: Store<IAppState>, protected imageryCommunicatorService: ImageryCommunicatorService) {
	}
}

// update per-overlay manual processing param (saved in case)
function updateOverlaysManualProcessArgs(selectedCase: Case, overlayId: string, processingParams?: ImageManualProcessArgs) {
	if (!selectedCase.state.overlaysManualProcessArgs) {
		selectedCase.state.overlaysManualProcessArgs = {};
	}
	selectedCase.state.overlaysManualProcessArgs[overlayId] = processingParams;
	return selectedCase;
}

function updatesMapAutoImageProcessingFlag(mapsState: IMapState, toggle: boolean, newValue?: boolean) {
	const activeMap: CaseMapState = MapFacadeService.activeMap(mapsState);
	if (toggle) {
		activeMap.data.isAutoImageProcessingActive = !activeMap.data.isAutoImageProcessingActive;
	} else {
		activeMap.data.isAutoImageProcessingActive = newValue;
	}
	return mapsState;
}
