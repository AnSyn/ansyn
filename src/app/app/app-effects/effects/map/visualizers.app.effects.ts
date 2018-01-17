import { GoToVisualizerType } from '@ansyn/open-layer-visualizers/tools/goto.visualizer';
import { IToolsState, toolsStateSelector } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { isEmpty } from 'lodash';
import {
	BackToWorldAction,
	DrawOverlaysOnMapTriggerAction,
	HoverFeatureTriggerAction,
	MapActionTypes,
	PinPointTriggerAction,
	ActiveMapChangedAction,
	SetMapsDataActionStore
} from '@ansyn/map-facade/actions/map.actions';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { IAppState } from '../../app.effects.module';
import { Store } from '@ngrx/store';
import { CaseMapState, OverlayDisplayMode } from '@ansyn/core/models/case.model';
import {
	DisplayOverlayFromStoreAction, DisplayOverlaySuccessAction, MouseOutDropAction, MouseOverDropAction,
	OverlaysActionTypes, OverlaysMarkupAction
} from '@ansyn/overlays/actions/overlays.actions';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { CommunicatorEntity } from '@ansyn/imagery/communicator-service/communicator.entity';
import {
	FootprintPolylineVisualizer,
	FootprintPolylineVisualizerType
} from '@ansyn/open-layer-visualizers/overlays/polyline-visualizer';
import { IOverlaysState, overlaysStateSelector } from '@ansyn/overlays/reducers/overlays.reducer';
import { casesStateSelector, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { IVisualizerEntity } from '@ansyn/imagery/model/imap-visualizer';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { FootprintHeatmapVisualizerType } from '@ansyn/open-layer-visualizers/overlays/heatmap-visualizer';
import {
	AnnotationVisualizerAgentAction,
	GoToInputChangeAction,
	SetAnnotationMode,
	ShowOverlaysFootprintAction,
	StartMouseShadow,
	StopMouseShadow,
	SetMeasureDistanceToolState,
	ToolsActionsTypes
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { IconVisualizerType } from '@ansyn/open-layer-visualizers/icon.visualizer';
import { MouseShadowVisualizerType } from '@ansyn/open-layer-visualizers/mouse-shadow.visualizer';
import { ContextEntityVisualizer } from '../../../index';
import { ContextEntityVisualizerType } from '../../../app-providers/app-visualizers/context-entity.visualizer';
import { CoreService } from '@ansyn/core/services/core.service';
import { coreStateSelector, ICoreState } from '@ansyn/core/reducers/core.reducer';
import { MeasureDistanceVisualizerType, MeasureDistanceVisualizer } from '@ansyn/open-layer-visualizers';

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
			id: payload,
			visualizerType: FootprintPolylineVisualizerType
		}));

	/**
	 * @type Effect
	 * @name onHoverFeatureEmitSyncHoverFeature$
	 * @ofType HoverFeatureTriggerAction
	 */
	@Effect({ dispatch: false })
	onHoverFeatureEmitSyncHoverFeature$: Observable<any> = this.actions$
		.ofType(MapActionTypes.VISUALIZERS.HOVER_FEATURE)
		.do((action: HoverFeatureTriggerAction): void => {
			this.imageryCommunicatorService.communicatorsAsArray().forEach((communicator: CommunicatorEntity) => {
				const visualizer = communicator.getVisualizer(FootprintPolylineVisualizerType);
				if (visualizer) {
					(<FootprintPolylineVisualizer>visualizer).setHoverFeature(action.payload.id);
				}
			});
		});

	/**
	 * @type Effect
	 * @name onDbclickFeaturePolylineDisplayAction$
	 * @ofType DbclickFeatureTriggerAction
	 * @filter TODO
	 * @action DisplayOverlayFromStoreAction
	 */
	@Effect()
	onDbclickFeaturePolylineDisplayAction$: Observable<DisplayOverlayFromStoreAction> = this.actions$
		.ofType(MapActionTypes.VISUALIZERS.DBCLICK_FEATURE)
		.map(toPayload)
		.filter(({ visualizerType }) => visualizerType === FootprintPolylineVisualizerType)
		.map(({ id }) => new DisplayOverlayFromStoreAction({ id }));

	/**
	 * @type Effect
	 * @name markupVisualizer$
	 * @ofType OverlaysMarkupAction
	 */
	@Effect({ dispatch: false })
	markupVisualizer$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.OVERLAYS_MARKUPS)
		.do((action: OverlaysMarkupAction) => {
			this.imageryCommunicatorService.communicatorsAsArray().forEach((communicator: CommunicatorEntity) => {
				const footprintPolyline = (<FootprintPolylineVisualizer>communicator.getVisualizer(FootprintPolylineVisualizerType));
				if (footprintPolyline) {
					footprintPolyline.setMarkupFeatures(action.payload);
				}
			});
		});

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
	 * @name drawOverlaysOnMap$
	 * @ofType DrawOverlaysOnMapTriggerAction
	 * @dependencies overlays, cases
	 */
	@Effect({ dispatch: false })
	drawOverlaysOnMap$: Observable<any> = this.actions$
		.ofType(MapActionTypes.DRAW_OVERLAY_ON_MAP)
		.withLatestFrom(this.store$.select(overlaysStateSelector), this.store$.select(mapStateSelector))
		.map(([action, overlaysState, { mapsList }]: [DrawOverlaysOnMapTriggerAction, IOverlaysState, IMapState]) => {
			mapsList.forEach((mapData: CaseMapState) => {
				this.drawOverlaysOnMap(mapData, overlaysState);
			});
		});

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
			const distanceVisualizerTool = <MeasureDistanceVisualizer>communicator.getVisualizer(MeasureDistanceVisualizerType);
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
			return [action, toolState.flags.get('isMeasureToolActive')];
		})
		.filter(([action, isMeasureToolActive]: [ActiveMapChangedAction, boolean]) => isMeasureToolActive)
		.map(([action, isMeasureToolActive]: [ActiveMapChangedAction, boolean]) => {
			this.imageryCommunicatorService.communicatorsAsArray().forEach(communicator => {
				const distanceVisualizerTool = <MeasureDistanceVisualizer>communicator.getVisualizer(MeasureDistanceVisualizerType);
				if (distanceVisualizerTool) {
					distanceVisualizerTool.clearInteractionAndEntities();
				}
			});

			const communicator = this.imageryCommunicatorService.provide(action.payload);
			const distanceVisualizerTool = <MeasureDistanceVisualizer>communicator.getVisualizer(MeasureDistanceVisualizerType);
			if (distanceVisualizerTool) {
				distanceVisualizerTool.createInteraction();
			}
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
		.map(([gotoExpand, map, activeCenter]: [boolean, IMapState, any[]]) => {
			const activeMap = MapFacadeService.activeMap(map);
			this.drawGotoIconOnMap(activeMap, activeCenter, gotoExpand);
		});

	/**
	 * @type Effect
	 * @name OnGoToInputChanged$
	 * @ofType GoToInputChangeAction
	 * @dependencies map
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
		.map(([mapState, coords]: [IMapState, number[]]) => {
			mapState.mapsList.forEach((map: CaseMapState) => {
				this.drawPinPointIconOnMap(map, coords);
			});
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
		.withLatestFrom(this.store$.select(toolsStateSelector), (action, toolState) => toolState.flags.get('shadowMouse'))
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
		.withLatestFrom(this.store$.select(toolsStateSelector), (action, toolState) => toolState.flags.get('shadowMouse'))
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
		.map(([mapState, coords]: [IMapState, any[]]) => {
			const activeMap = MapFacadeService.activeMap(mapState);
			this.drawGotoIconOnMap(activeMap, coords);
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
		.ofType<DisplayOverlaySuccessAction | BackToWorldAction>(OverlaysActionTypes.DISPLAY_OVERLAY_SUCCESS, MapActionTypes.BACK_TO_WORLD)
		.withLatestFrom(this.store$.select(mapStateSelector), this.store$.select(casesStateSelector))
		.filter(([action, mapState, casesState]: [DisplayOverlaySuccessAction | BackToWorldAction, IMapState, ICasesState]) => !isEmpty(casesState.selectedCase.state.contextEntities))
		.do(([action, mapState, casesState]: [DisplayOverlaySuccessAction | BackToWorldAction, IMapState, ICasesState]) => {
			const mapId = action.payload.mapId || mapState.activeMapId;
			const selectedMap: CaseMapState = MapFacadeService.mapById(mapState.mapsList, mapId);
			const communicatorHandler = this.imageryCommunicatorService.provide(mapId);

			const vis = <ContextEntityVisualizer>communicatorHandler.getVisualizer(ContextEntityVisualizerType);
			vis.setReferenceDate(action instanceof DisplayOverlaySuccessAction ? selectedMap.data.overlay.date : null);
		});


	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}

	drawOverlaysOnMap(mapData: CaseMapState, overlayState: IOverlaysState) {
		const communicator = this.imageryCommunicatorService.provide(mapData.id);
		if (communicator && mapData.data.overlayDisplayMode) {
			const polylineVisualizer = communicator.getVisualizer(FootprintPolylineVisualizerType);
			const hitMapVisualizer = communicator.getVisualizer(FootprintHeatmapVisualizerType);
			if (!polylineVisualizer || !hitMapVisualizer) {
				return;
			}
			const overlayDisplayMode: OverlayDisplayMode = mapData.data.overlayDisplayMode;
			switch (overlayDisplayMode) {
				case 'Hitmap': {
					const entitiesToDraw = this.getEntitiesToDraw(overlayState);
					hitMapVisualizer.setEntities(entitiesToDraw);
					polylineVisualizer.clearEntities();
					break;
				}
				case 'Polygon': {
					const entitiesToDraw = this.getEntitiesToDraw(overlayState);
					polylineVisualizer.setEntities(entitiesToDraw);
					hitMapVisualizer.clearEntities();
					break;
				}
				case 'None':
				default: {
					polylineVisualizer.clearEntities();
					hitMapVisualizer.clearEntities();
				}
			}
		}
	}

	drawGotoIconOnMap(mapData: CaseMapState, point: any[], gotoExpand = true) {
		if (!mapData) {
			return;
		}

		const communicator = this.imageryCommunicatorService.provide(mapData.id);
		if (!communicator) {
			return;
		}
		const gotoVisualizer = communicator.getVisualizer(GoToVisualizerType);
		if (!gotoVisualizer) {
			return;
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
			gotoVisualizer.setEntities([{ id: 'goto', featureJson: gotoFeatureJson }]);
		} else {
			gotoVisualizer.clearEntities();


		}
	}

	drawPinPointIconOnMap(mapData: CaseMapState, point: any[]) {
		const communicator = this.imageryCommunicatorService.provide(mapData.id);
		if (communicator) {
			const iconVisualizer = communicator.getVisualizer(IconVisualizerType);
			if (!iconVisualizer) {
				return;
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
				iconVisualizer.setEntities([{ id: 'pinPoint', featureJson: pinFeatureJson }]);
			}
		}
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
				const mouseShadowVisualizer = communicator.getVisualizer(MouseShadowVisualizerType);
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
				mouseShadowVisualizer.setEntities([{ id: 'shadowMouse', featureJson: shadowMouseFeatureJson }]);
			});
		}
	}

	// clear shadow entities
	clearShadowMouseEntities(mapData: CaseMapState) {
		const communicator = this.imageryCommunicatorService.provide(mapData.id);
		if (communicator) {
			const mouseShadowVisualizer = communicator.getVisualizer(MouseShadowVisualizerType);
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

	getEntitiesToDraw(overlayState: IOverlaysState): IVisualizerEntity[] {
		const overlaysToDraw = <any[]> OverlaysService.pluck(overlayState.overlays, overlayState.filteredOverlays, ['id', 'footprint']);
		return overlaysToDraw.map(({ id, footprint }) => {
			const featureJson: GeoJSON.Feature<any> = {
				type: 'Feature',
				// calculate projection?
				geometry: footprint,
				properties: {}
			};
			return {
				id,
				featureJson
			};
		});
	}

}
