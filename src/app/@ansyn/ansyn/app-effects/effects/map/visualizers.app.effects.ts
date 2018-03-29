import { IToolsState, toolsStateSelector } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { Actions, Effect } from '@ngrx/effects';
import { differenceWith } from 'lodash';
import {
	ActiveMapChangedAction,
	DrawOverlaysOnMapTriggerAction,
	HoverFeatureTriggerAction,
	MapActionTypes,
	PinPointTriggerAction,
	SetMapsDataActionStore
} from '@ansyn/map-facade/actions/map.actions';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { IAppState } from '../../app.effects.module';
import { Store } from '@ngrx/store';
import { CaseMapState, OverlayDisplayMode } from '@ansyn/core/models/case.model';
import {
	DisplayOverlaySuccessAction,
	MouseOutDropAction,
	MouseOverDropAction,
	OverlaysActionTypes,
	OverlaysMarkupAction
} from '@ansyn/overlays/actions/overlays.actions';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import { FootprintPolylineVisualizer } from '@ansyn/plugins/openlayers/open-layer-visualizers/overlays/polyline-visualizer';
import { IOverlaysState, overlaysStateSelector } from '@ansyn/overlays/reducers/overlays.reducer';
import { casesStateSelector, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { IVisualizerEntity } from '@ansyn/imagery/model/base-imagery-visualizer';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import {
	GoToInputChangeAction,
	SetAnnotationMode,
	SetMeasureDistanceToolState,
	ShowOverlaysFootprintAction,
	StartMouseShadow,
	StopMouseShadow,
	ToolsActionsTypes
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { ContextEntityVisualizer } from '../../../app-providers/app-visualizers/context-entity.visualizer';
import { CoreService } from '@ansyn/core/services/core.service';
import { coreStateSelector, ICoreState } from '@ansyn/core/reducers/core.reducer';
import {
	FootprintHeatmapVisualizer,
	GoToVisualizer,
	MeasureDistanceVisualizer
} from '@ansyn/plugins/openlayers/open-layer-visualizers';
import { SetPinLocationModeAction, toolsFlags } from '@ansyn/menu-items';
import { BackToWorldView, ClearActiveInteractionsAction, CoreActionTypes, Overlay } from '@ansyn/core';
import { statusBarFlagsItems, UpdateStatusFlagsAction } from '@ansyn/status-bar';
import { FrameVisualizer } from '@ansyn/plugins/openlayers/open-layer-visualizers/overlays/frame-visualizer';
import { IconVisualizer } from '@ansyn/plugins/openlayers/open-layer-visualizers/icon.visualizer';
import { MouseShadowVisualizer } from '@ansyn/plugins/openlayers/open-layer-visualizers/tools/mouse-shadow.visualizer';

@Injectable()
export class VisualizersAppEffects {
	/**
	 * @type Effect
	 * @name onHoverFeatureSetMarkup$
	 * @ofType HoverFeatureTriggerAction
	 * @dependencies cases
	 * @action OverlaysMarkupAction
	 */
	@Effect()
	onHoverFeatureSetMarkup$: Observable<any> = this.actions$
		.ofType(MapActionTypes.VISUALIZERS.HOVER_FEATURE)
		.withLatestFrom(this.store$.select(mapStateSelector), this.store$.select(coreStateSelector))
		.map(([action, map, core]: [HoverFeatureTriggerAction, IMapState, ICoreState]) => {
			const markups = CoreService.getOverlaysMarkup(map.mapsList, map.activeMapId, core.favoriteOverlays, action.payload.id);
			return new OverlaysMarkupAction(markups);
		});

	/**
	 * @type Effect
	 * @name onMouseOverDropAction$
	 * @ofType MouseOverDropAction, MouseOutDropAction
	 * @action HoverFeatureTriggerAction
	 */
	@Effect()
	onMouseOverDropAction$: Observable<HoverFeatureTriggerAction> = this.actions$
		.ofType(OverlaysActionTypes.MOUSE_OVER_DROP, OverlaysActionTypes.MOUSE_OUT_DROP)
		.map((action: MouseOverDropAction | MouseOutDropAction) => action instanceof MouseOverDropAction ? action.payload : undefined)
		.map((payload: string | undefined) => new HoverFeatureTriggerAction({
			id: payload
		}));

	/**
	 * @type Effect
	 * @name updateCaseFromTools$
	 * @ofType ShowOverlaysFootprintAction
	 * @dependencies map
	 * @action SetMapsDataActionStore, DrawOverlaysOnMapTriggerAction
	 */
	@Effect()
	updateCaseFromTools$: Observable<any> = this.actions$
		.ofType<ShowOverlaysFootprintAction>(ToolsActionsTypes.SHOW_OVERLAYS_FOOTPRINT)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.mergeMap(([action, mapState]: [ShowOverlaysFootprintAction, IMapState]) => {
			const mapsList = [...mapState.mapsList];
			const activeMap = MapFacadeService.activeMap(mapState);
			activeMap.data.overlayDisplayMode = action.payload;
			return [
				new SetMapsDataActionStore({ mapsList }),
				new DrawOverlaysOnMapTriggerAction()
			];
		});

	/**
	 * @type Effect
	 * @name shouldDrawOverlaysOnMap$
	 * @ofType SetFilteredOverlaysAction, MapInstanceChangedAction
	 * @action DrawOverlaysOnMapTriggerAction
	 */
	@Effect()
	shouldDrawOverlaysOnMap$: Observable<DrawOverlaysOnMapTriggerAction> = this.actions$
		.ofType(OverlaysActionTypes.SET_FILTERED_OVERLAYS, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
		.map((action) => new DrawOverlaysOnMapTriggerAction());

	/**
	 * @type Effect
	 * @name drawDistamceMeasureOnMap$
	 * @ofType DrawOverlaysOnMapTriggerAction
	 * @dependencies overlays, cases
	 */
	@Effect({ dispatch: false })
	drawDistamceMeasureOnMap$: Observable<any> = this.actions$
		.ofType<SetMeasureDistanceToolState>(ToolsActionsTypes.SET_MEASURE_TOOL_STATE)
		.withLatestFrom(this.store$.select(mapStateSelector), (action, mapState: IMapState) => [action, mapState])
		.map(([action, mapState]: [SetMeasureDistanceToolState, IMapState]) => {
			const activeMapState = MapFacadeService.activeMap(mapState);
			const communicator = this.imageryCommunicatorService.provide(activeMapState.id);
			const distanceVisualizerTool = communicator.getPlugin<MeasureDistanceVisualizer>(MeasureDistanceVisualizer);
			if (distanceVisualizerTool) {
				if (action.payload) {
					distanceVisualizerTool.createInteraction();
				} else {
					distanceVisualizerTool.clearInteractionAndEntities();
				}
			}
		});

	/**
	 * @type Effect
	 * @name onActiveMapChangesDeleteOldMeasureLayer$
	 * @ofType ActiveMapChangedAction
	 * @dependencies map
	 */
	@Effect({ dispatch: false })
	onActiveMapChangesDeleteOldMeasureLayer$ = this.actions$
		.ofType<ActiveMapChangedAction>(MapActionTypes.TRIGGER.ACTIVE_MAP_CHANGED)
		.withLatestFrom(this.store$.select(toolsStateSelector), (action, toolState) => {
			return [action, toolState.flags.get(toolsFlags.isMeasureToolActive)];
		})
		.filter(([action, isMeasureToolActive]: [ActiveMapChangedAction, boolean]) => isMeasureToolActive)
		.map(([action, isMeasureToolActive]: [ActiveMapChangedAction, boolean]) => {
			this.imageryCommunicatorService.communicatorsAsArray().forEach(communicator => {
				const distanceVisualizerTool = communicator.getPlugin<MeasureDistanceVisualizer>(MeasureDistanceVisualizer);
				if (distanceVisualizerTool) {
					distanceVisualizerTool.clearInteractionAndEntities();
				}
			});

			const communicator = this.imageryCommunicatorService.provide(action.payload);
			const distanceVisualizerTool = communicator.getPlugin<MeasureDistanceVisualizer>(MeasureDistanceVisualizer);
			if (distanceVisualizerTool) {
				distanceVisualizerTool.createInteraction();
			}
		});

	/**
	 * @type Effect
	 * @name onActiveMapChangesRedrawPinLocation$
	 * @ofType ActiveMapChangedAction
	 * @dependencies mapState, toolState
	 */
	@Effect({ dispatch: false })
	onActiveMapChangesRedrawPinLocation$ = this.actions$
		.ofType<ActiveMapChangedAction>(MapActionTypes.TRIGGER.ACTIVE_MAP_CHANGED)
		.withLatestFrom(
			this.store$.select(mapStateSelector),
			this.store$.select(toolsStateSelector),
			(action, mapState, toolState) => [action, mapState, toolState]
		)
		.filter(([action, mapState, toolState]: [ActiveMapChangedAction, IMapState, IToolsState]) => toolState.gotoExpand)
		.mergeMap(([action, mapState, toolState]: [ActiveMapChangedAction, IMapState, IToolsState]) => {
			return Observable.forkJoin(mapState.mapsList.map((map: CaseMapState) => {
				return this.drawGotoIconOnMap(map, toolState.activeCenter, map.id === action.payload);
			}));
		});

	/**
	 * @type Effect
	 * @name gotoIconVisibilityOnGoToWindowChanged$
	 * @ofType GoToExpandAction
	 * @dependencies tools, map
	 */
	@Effect({ dispatch: false })
	gotoIconVisibilityOnGoToWindowChanged$ = this.actions$
		.ofType(ToolsActionsTypes.GO_TO_EXPAND)
		.withLatestFrom(
			this.store$.select(toolsStateSelector).pluck<IToolsState, boolean>('gotoExpand'),
			this.store$.select(mapStateSelector),
			this.store$.select(toolsStateSelector).pluck('activeCenter'),
			(action, gotoExpand, map, activeCenter) => [gotoExpand, map, activeCenter]
		)
		.mergeMap(([gotoExpand, map, activeCenter]: [boolean, IMapState, any[]]) => {
			const activeMap = MapFacadeService.activeMap(map);
			return this.drawGotoIconOnMap(activeMap, activeCenter, gotoExpand);
		});

	/**
	 * @type Effect
	 * @name drawPinPoint$
	 * @ofType DrawPinPointAction
	 */
	@Effect({ dispatch: false })
	drawPinPoint$ = this.actions$
		.ofType(MapActionTypes.DRAW_PIN_POINT_ON_MAP)
		.withLatestFrom(
			this.store$.select(mapStateSelector),
			(action: PinPointTriggerAction, mapState: IMapState) => {
				return [mapState, action.payload];
			}
		)
		.switchMap(([mapState, coords]: [IMapState, number[]]) => {
			const observables = [];

			mapState.mapsList.forEach((map: CaseMapState) => {
				observables.push(this.drawPinPointIconOnMap(map, coords));
			});

			return Observable.forkJoin(observables);
		});

	/**
	 * @type Effect
	 * @name onStartMapShadow$
	 * @ofType StartMouseShadow
	 */
	@Effect({ dispatch: false })
	onStartMapShadow$: any = this.actions$
		.ofType(ToolsActionsTypes.START_MOUSE_SHADOW)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.map(([action, mapState]: [StartMouseShadow, IMapState]) => {
			let shadowMouseProducer: Observable<any>;
			const shadowMouseConsumers = new Array<CaseMapState>();
			mapState.mapsList.forEach((map: CaseMapState) => {
				this.clearShadowMouse(map); // remove all previous listeners and drawers

				if (map.id === mapState.activeMapId) {
					shadowMouseProducer = this.setShadowMouseProducer(map);
				} else {
					shadowMouseConsumers.push(map);
				}
			});
			shadowMouseConsumers.forEach((map: CaseMapState) => this.addShadowMouseConsumer(map, shadowMouseProducer));
		});

	/**
	 * @type Effect
	 * @name onActiveImageryMouseLeave$
	 * @ofType ActiveImageryMouseLeave
	 * @filter shadow Mouse is on
	 * @action StopMouseShadow
	 */
	@Effect()
	onActiveImageryMouseLeave$ = this.actions$
		.ofType(MapActionTypes.TRIGGER.ACTIVE_IMAGERY_MOUSE_LEAVE)
		.withLatestFrom(this.store$.select(toolsStateSelector), (action, toolState) => toolState.flags.get(toolsFlags.shadowMouse))
		.filter((shadowMouseOn: boolean) => shadowMouseOn)
		.map(() => new StopMouseShadow({ updateTools: false }));

	/**
	 * @type Effect
	 * @name onActiveImageryMouseEnter$
	 * @ofType ActiveImageryMouseEnter
	 * @filter shadow Mouse is on
	 * @action StartMouseShadow
	 */
	@Effect()
	onActiveImageryMouseEnter$ = this.actions$
		.ofType(MapActionTypes.TRIGGER.ACTIVE_IMAGERY_MOUSE_ENTER)
		.withLatestFrom(this.store$.select(toolsStateSelector), (action, toolState) => toolState.flags.get(toolsFlags.shadowMouse))
		.filter((shadowMouseOn: boolean) => shadowMouseOn)
		.map(() => new StartMouseShadow({ updateTools: false }));

	/**
	 * @type Effect
	 * @name onEndMapShadow$
	 * @ofType StopMouseShadow
	 */
	@Effect({ dispatch: false })
	onEndMapShadow$ = this.actions$
		.ofType(ToolsActionsTypes.STOP_MOUSE_SHADOW)
		.withLatestFrom(this.store$.select(mapStateSelector))
		.map(([action, mapState]: [StopMouseShadow, IMapState]) => {
			mapState.mapsList.forEach((map: CaseMapState) => {
				// remove all listeners and drawers
				this.clearShadowMouse(map);
			});
		});

	/**
	 * @type Effect
	 * @name OnGoToInputChanged$
	 * @ofType GoToInputChangeAction
	 * @dependencies map
	 */
	@Effect({ dispatch: false })
	OnGoToInputChanged$ = this.actions$
		.ofType(ToolsActionsTypes.GO_TO_INPUT_CHANGED)
		.skip(1)
		.withLatestFrom(
			this.store$.select(mapStateSelector),
			(action: GoToInputChangeAction, mapState) => {
				return [mapState, action.payload];

			}
		)
		.switchMap(([mapState, coords]: [IMapState, any[]]) => {
			const activeMap = MapFacadeService.activeMap(mapState);
			return this.drawGotoIconOnMap(activeMap, coords);
		});

	/**
	 * @type Effect
	 * @name displayEntityTimeFromOverlay$
	 * @ofType DisplayOverlaySuccessAction, BackToWorldAction
	 * @dependencies map, cases
	 * @filter Only when context
	 */
	@Effect({ dispatch: false })
	displayEntityTimeFromOverlay$: Observable<any> = this.actions$
		.ofType<DisplayOverlaySuccessAction | BackToWorldView>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS, CoreActionTypes.BACK_TO_WORLD_VIEW)
		.withLatestFrom(this.store$.select(mapStateSelector), this.store$.select(casesStateSelector))
		.filter(([action, mapState, casesState]: [DisplayOverlaySuccessAction | BackToWorldView, IMapState, ICasesState]) => Boolean(casesState.selectedCase.state.contextEntities) && casesState.selectedCase.state.contextEntities.length > 0)
		.do(([action, mapState, casesState]: [DisplayOverlaySuccessAction | BackToWorldView, IMapState, ICasesState]) => {
			const mapId = action.payload.mapId || mapState.activeMapId;
			const selectedMap: CaseMapState = MapFacadeService.mapById(mapState.mapsList, mapId);
			const communicatorHandler = this.imageryCommunicatorService.provide(mapId);

			const vis = communicatorHandler.getPlugin<ContextEntityVisualizer>(ContextEntityVisualizer);
			vis.setReferenceDate(action instanceof DisplayOverlaySuccessAction ? selectedMap.data.overlay.date : null);
		});

	/**
	 * @type Effect
	 * @name clearActiveInteractions$
	 * @ofType ClearActiveInteractionsAction
	 * @action SetMeasureDistanceToolState?, SetAnnotationMode?, UpdateStatusFlagsAction?, SetPinLocationModeAction?
	 */
	@Effect()
	clearActiveInteractions$ = this.actions$
		.ofType<ClearActiveInteractionsAction>(CoreActionTypes.CLEAR_ACTIVE_INTERACTIONS)
		.mergeMap(action => {
			// reset the following interactions: Measure Distance, Annotation, Pinpoint search, Pin location
			let clearActions = [
				new SetMeasureDistanceToolState(false),
				new SetAnnotationMode(),
				new UpdateStatusFlagsAction({ key: statusBarFlagsItems.pinPointSearch, value: false }),
				new SetPinLocationModeAction(false)
			];
			// return defaultClearActions without skipClearFor
			if (action.payload && action.payload.skipClearFor) {
				clearActions = differenceWith(clearActions, action.payload.skipClearFor,
					(act, actType) => act instanceof actType);
			}
			return clearActions;
		});

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}

	getPlugin<T>(mapId, visualizerType): T {
		const communicator = this.imageryCommunicatorService.provide(mapId);
		return communicator ? communicator.getPlugin<T>(visualizerType) : null;
	}

	drawGotoIconOnMap(mapData: CaseMapState, point: any[], gotoExpand = true): Observable<boolean> {
		if (!mapData) {
			return Observable.of(true);
		}

		const communicator = this.imageryCommunicatorService.provide(mapData.id);
		if (!communicator) {
			return Observable.of(true);
		}
		const gotoVisualizer = communicator.getPlugin<GoToVisualizer>(GoToVisualizer);
		if (!gotoVisualizer) {
			return Observable.of(true);
		}
		if (gotoExpand) {
			const gotoPoint: GeoJSON.Point = {
				type: 'Point',
				// calculate projection?
				coordinates: point
			};
			const gotoFeatureJson: GeoJSON.Feature<any> = {
				type: 'Feature',
				geometry: gotoPoint,
				properties: {}
			};
			gotoVisualizer.clearEntities();
			return gotoVisualizer.setEntities([{ id: 'goto', featureJson: gotoFeatureJson }]);
		} else {
			gotoVisualizer.clearEntities();
		}

		return Observable.of(true);
	}

	drawPinPointIconOnMap(mapData: CaseMapState, point: any[]): Observable<boolean> {
		const communicator = this.imageryCommunicatorService.provide(mapData.id);
		if (communicator) {
			const iconVisualizer = communicator.getPlugin<IconVisualizer>(IconVisualizer);
			if (!iconVisualizer) {
				return Observable.of(true);
			}
			iconVisualizer.clearEntities();
			if (point) {
				const pinPoint: GeoJSON.Point = {
					type: 'Point',
					// calculate projection?
					coordinates: point
				};
				const pinFeatureJson: GeoJSON.Feature<any> = {
					type: 'Feature',
					geometry: pinPoint,
					properties: {}
				};
				return iconVisualizer.setEntities([{ id: 'pinPoint', featureJson: pinFeatureJson }]);
			}
		}

		return Observable.of(true);
	}

	// set shadow mouse producer (remove previous producers)
	setShadowMouseProducer(mapData: CaseMapState): Observable<any> {
		this.removeShadowMouseProducer(mapData); // remove previous producer
		const communicator = this.imageryCommunicatorService.provide(mapData.id);
		if (communicator) {
			return communicator.setMouseShadowListener(true);
		}
	}

	// clear shadow mouse producer
	removeShadowMouseProducer(mapData: CaseMapState) {
		const communicator = this.imageryCommunicatorService.provide(mapData.id);
		if (communicator) {
			communicator.setMouseShadowListener(false);
		}
	}

	// add shadow mouse consumer (listen to producer)
	addShadowMouseConsumer(mapData: CaseMapState, pointerMoveProducer: Observable<any>) {
		const communicator = this.imageryCommunicatorService.provide(mapData.id);
		if (communicator && pointerMoveProducer) {
			pointerMoveProducer.subscribe(point => {
				const mouseShadowVisualizer = communicator.getPlugin<MouseShadowVisualizer>(MouseShadowVisualizer);
				if (!mouseShadowVisualizer) {
					return;
				}

				const shadowMousePoint: GeoJSON.Point = {
					type: 'Point',
					// calculate projection?
					coordinates: point
				};
				const shadowMouseFeatureJson: GeoJSON.Feature<any> = {
					type: 'Feature',
					geometry: shadowMousePoint,
					properties: {}
				};
				mouseShadowVisualizer.clearEntities();
				mouseShadowVisualizer.setEntities([{ id: 'shadowMouse', featureJson: shadowMouseFeatureJson }])
					.subscribe();
			});
		}
	}

	// clear shadow entities
	clearShadowMouseEntities(mapData: CaseMapState) {
		const communicator = this.imageryCommunicatorService.provide(mapData.id);
		if (communicator) {
			const mouseShadowVisualizer = communicator.getPlugin<MouseShadowVisualizer>(MouseShadowVisualizer);
			if (!mouseShadowVisualizer) {
				return;
			}
			mouseShadowVisualizer.clearEntities();
		}
	}

	// clear shadow mouse producer and entities
	clearShadowMouse(mapData: CaseMapState) {
		// remove producer (in case this is shadow producer)
		this.removeShadowMouseProducer(mapData);
		// clear shadow layer (in case this is shadow consumer)
		this.clearShadowMouseEntities(mapData);
	}

}
