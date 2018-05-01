import { Inject, Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import {
	DisableImageProcessing,
	DisableMouseShadow,
	EnableImageProcessing,
	EnableMouseShadow,
	GoToAction,
	SetActiveCenter,
	SetActiveOverlaysFootprintModeAction,
	SetAutoImageProcessing,
	SetAutoImageProcessingSuccess,
	SetManualImageProcessing,
	SetPinLocationModeAction,
	ShowOverlaysFootprintAction,
	StopMouseShadow,
	ToolsActionsTypes
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { CasesActionTypes } from '@ansyn/menu-items/cases/actions/cases.actions';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import 'rxjs/add/operator/withLatestFrom';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import {
	AnnotationRemoveFeature,
	MapActionTypes,
	PinLocationModeTriggerAction,
	SetMapsDataActionStore
} from '@ansyn/map-facade/actions/map.actions';
import { DisplayOverlaySuccessAction, OverlaysActionTypes } from '@ansyn/overlays/actions/overlays.actions';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { CaseMapState, ImageManualProcessArgs } from '@ansyn/core/models/case.model';

import { ILayerState, layersStateSelector } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { Feature, FeatureCollection, Point } from 'geojson';
import { SetAnnotationsLayer } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import {
	IStatusBarState,
	selectGeoFilter,
	statusBarStateSelector
} from '@ansyn/status-bar/reducers/status-bar.reducer';
import { statusBarFlagsItemsEnum } from '@ansyn/status-bar/models/status-bar-flag-items.model';
import { MenuActionTypes, SelectMenuItemAction } from '@ansyn/menu/actions/menu.actions';
import { StatusBarActionsTypes, UpdateStatusFlagsAction } from '@ansyn/status-bar/actions/status-bar.actions';
import { CoreActionTypes, SetLayoutAction } from '@ansyn/core/actions/core.actions';
import { IToolsState, toolsStateSelector } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { layoutOptions } from '@ansyn/core/models/layout-options.model';
import { IImageProcParam, IToolsConfig, toolsConfig } from '@ansyn/menu-items/tools/models/tools-config';
import { IAppState } from '@ansyn/ansyn/app-effects/app.effects.module';
import { isEqual } from 'lodash';


@Injectable()
export class ToolsAppEffects {
	layersState$ = this.store$.select(layersStateSelector);

	flags$ = this.store$.select(statusBarStateSelector)
		.pluck<IStatusBarState, Map<statusBarFlagsItemsEnum, boolean>>('flags')
		.distinctUntilChanged();

	isPolygonSearch$ = this.flags$
		.map((flags) => flags.get(statusBarFlagsItemsEnum.geoFilterSearch))
		.distinctUntilChanged();

	isPolygonGeoFilter$ = this.store$.select(selectGeoFilter)
		.map((geoFilter) => geoFilter === 'Polygon')
		.distinctUntilChanged();

	activeMap$ = this.store$.select(mapStateSelector)
		.map((mapState) => MapFacadeService.activeMap(mapState))
		.filter(Boolean);

	get params(): Array<IImageProcParam> {
		return this.config.ImageProcParams;
	}

	get defaultImageManualProcessArgs(): ImageManualProcessArgs {
		return this.params.reduce<ImageManualProcessArgs>((initialObject: any, imageProcParam) => {
			return <any> { ...initialObject, [imageProcParam.name]: imageProcParam.defaultValue };
		}, {});
	}

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
			ToolsActionsTypes.SET_SUB_MENU)
		.withLatestFrom(this.isPolygonSearch$, this.isPolygonGeoFilter$)
		.filter(([action, isPolygonSearch, isPolygonGeoFilter]: [SelectMenuItemAction, boolean, boolean]) => isPolygonSearch && isPolygonGeoFilter)
		.map(() => new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterSearch, value: false }));

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
		.mergeMap((activeMap: CaseMapState) => {
			const actions: Action[] = [new SetActiveOverlaysFootprintModeAction(activeMap.data.overlayDisplayMode)];
			if (!Boolean(activeMap.data.overlay)) {
				actions.push(new DisableImageProcessing());
			}
			return actions;
		});


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


	@Effect()
	onDisplayOverlaySuccess$: Observable<any> = this.actions$
		.ofType<DisplayOverlaySuccessAction>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS)
		.filter((action: DisplayOverlaySuccessAction) => !action.payload.forceFirstDisplay)
		.withLatestFrom(this.store$.select(mapStateSelector), this.store$.select(toolsStateSelector))
		.map(([action, mapState, toolsState]: [DisplayOverlaySuccessAction, IMapState, IToolsState]) => {
			const imageManualProcessArgs: ImageManualProcessArgs = this.defaultImageManualProcessArgs;
			const updatedMapList = [...mapState.mapsList];
			const mapToUpdate = MapFacadeService.mapById(updatedMapList, action.payload.mapId);

			mapToUpdate.data.imageManualProcessArgs = toolsState.overlaysManualProcessArgs[action.payload.overlay.id] || imageManualProcessArgs;

			return new SetMapsDataActionStore({ mapsList: updatedMapList });
		});

	@Effect()
	updateImageProcessingOnTools$: Observable<any> = this
		.activeMap$
		.filter((map) => Boolean(map.data.overlay))
		.withLatestFrom(this.store$.select(toolsStateSelector).pluck<IToolsState, ImageManualProcessArgs>('manualImageProcessingParams'))
		.mergeMap(([map, manualImageProcessingParams]: [CaseMapState, ImageManualProcessArgs]) => {
			const actions = [new EnableImageProcessing(), new SetAutoImageProcessingSuccess(map.data.isAutoImageProcessingActive)];
			if (!isEqual(map.data.imageManualProcessArgs, manualImageProcessingParams)) {
				actions.push(new SetManualImageProcessing(map.data && map.data.imageManualProcessArgs || this.defaultImageManualProcessArgs));
			}

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
		.withLatestFrom(this.store$.select(mapStateSelector))
		.mergeMap(([action, mapsState]: [SetAutoImageProcessing, IMapState]) => {
			const activeMap: CaseMapState = MapFacadeService.activeMap(mapsState);
			activeMap.data.isAutoImageProcessingActive = !activeMap.data.isAutoImageProcessingActive;
			return [
				new SetMapsDataActionStore({ mapsList: [...mapsState.mapsList] }),
				new SetAutoImageProcessingSuccess(activeMap.data.isAutoImageProcessingActive)
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
		.map((activeMapCenter: Point) => new SetActiveCenter(activeMapCenter.coordinates));

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
			const center: Point = {
				type: 'Point',
				coordinates: action.payload
			};

			return communicator.setCenter(center).map(() => {
				return { action, communicator };
			});
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

	constructor(protected actions$: Actions, protected store$: Store<IAppState>, protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(toolsConfig) protected config: IToolsConfig) {
	}
}
