import { GoToVisualizerType } from '@ansyn/open-layer-visualizers/tools/goto.visualizer';
import { IToolsState, toolsStateSelector } from '@ansyn/menu-items/tools/reducers/tools.reducer';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import {
	AnnotationData,
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
import { Case, CaseMapState, OverlayDisplayMode } from '@ansyn/core/models/case.model';
import {
	DisplayOverlayFromStoreAction,
	MouseOutDropAction,
	MouseOverDropAction,
	OverlaysActionTypes,
	OverlaysMarkupAction
} from '@ansyn/overlays/actions/overlays.actions';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
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
import { cloneDeep as _cloneDeep } from 'lodash';
import {
	AnnotationVisualizerAgentAction,
	GoToInputChangeAction,
	SetAnnotationMode,
	ShowOverlaysFootprintAction,
	StartMouseShadow,
	StopMouseShadow,
	ToolsActionsTypes
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { AnnotationsVisualizer, AnnotationVisualizerType } from '@ansyn/open-layer-visualizers/annotations.visualizer';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { IconVisualizerType } from '@ansyn/open-layer-visualizers/icon.visualizer';
import { MouseShadowVisualizerType } from '@ansyn/open-layer-visualizers/mouse-shadow.visualizer';
import GeoJSON from 'ol/format/geojson';
import { ILayerState, layersStateSelector } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';


@Injectable()
export class VisualizersAppEffects {
	public selectedCase$ = this.store$.select<ICasesState>(casesStateSelector)
		.pluck<ICasesState, Case>('selectedCase')
		.map(_cloneDeep);

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
		.withLatestFrom(this.store$.select(casesStateSelector).pluck('selectedCase'))
		.map(([action, selectedCase]: [HoverFeatureTriggerAction, Case]) => {
			const markups = CasesService.getOverlaysMarkup(selectedCase, action.payload.id);
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
					visualizer.setHoverFeature(action.payload.id);
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
			// @TODO this is reference --- not good - need to be changed
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
	 * @ofType SetFiltersAction, MapInstanceChangedAction
	 * @action DrawOverlaysOnMapTriggerAction
	 */
	@Effect()
	shouldDrawOverlaysOnMap$: Observable<DrawOverlaysOnMapTriggerAction> = this.actions$
		.ofType(OverlaysActionTypes.SET_FILTERS, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
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
		.withLatestFrom(this.store$.select(overlaysStateSelector), this.store$.select(casesStateSelector), (action, overlaysState: IOverlaysState, casesState: ICasesState) => {
			return [overlaysState, casesState.selectedCase];
		})
		.map(([overlaysState, selectedCase]: [IOverlaysState, Case]) => {
			selectedCase.state.maps.data.forEach((mapData: CaseMapState) => {
				this.drawOverlaysOnMap(mapData, overlaysState);
			});
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
	 * @name annotationData$
	 * @ofType AnnotationData
	 * @action UpdateCaseAction, AnnotationVisualizerAgentAction
	 */
	@Effect()
	annotationData$: Observable<any> = this.actions$
		.ofType<AnnotationData>(MapActionTypes.STORE.ANNOTATION_DATA)
		.withLatestFrom(this.selectedCase$)
		.mergeMap(([action, selectedCase]) => {
			const annotationsLayer = JSON.parse((<string>selectedCase.state.layers.annotationsLayer));
			const geoJsonFormat = new GeoJSON();

			// @TODO move the remove to a function
			const featureIndex = annotationsLayer.features.findIndex(featureString => {
				const feature = geoJsonFormat.readFeature(featureString);
				return feature.values_.id === action.payload.feature.values_.id;
			});

			switch (action.payload.action) {
				case 'remove':
					annotationsLayer.features.splice(featureIndex, 1);

					selectedCase.state = {
						...selectedCase.state,
						layers: {
							...selectedCase.state.layers, annotationsLayer: JSON.stringify(annotationsLayer)
						}
					};
					break;
			}

			return [
				new UpdateCaseAction(selectedCase),
				new AnnotationVisualizerAgentAction({
					maps: 'all',
					action: 'show'
				})
			];


		});

	/**
	 * @type Effect
	 * @name annotationVisualizerAgent$
	 * @ofType AnnotationVisualizerAgentAction
	 * @dependencies cases, layers
	 * @action UpdateCaseAction?, SetAnnotationMode?
	 */
	@Effect()
	annotationVisualizerAgent$: Observable<any> = this.actions$
		.ofType<AnnotationVisualizerAgentAction>(ToolsActionsTypes.ANNOTATION_VISUALIZER_AGENT)
		.withLatestFrom<AnnotationVisualizerAgentAction, Case, ILayerState>(this.selectedCase$, this.store$.select(layersStateSelector))
		.map(([action, selectedCase, layerState]: [AnnotationVisualizerAgentAction, Case, ILayerState]) => {

			let update = false;
			let relevantMapsIds = [];

			// we also need to add specific ids for maps that the layers are disabled or
			// I can check that in the maps == all in the state of the map instance
			switch (action.payload.maps) {
				case 'all':
					relevantMapsIds = selectedCase.state.maps.data.map(m => m.id);
					break;
				case 'active':
					relevantMapsIds.push(selectedCase.state.maps.activeMapId);
					break;
				case 'others':
					relevantMapsIds = selectedCase.state.maps.data.filter(m => m.id !== selectedCase.state.maps.activeMapId)
						.map(m => m.id);
					break;
				default:
					return;
			}

			const visualizers: Array<AnnotationsVisualizer> = relevantMapsIds
				.map(id => {
					const communicator = this.imageryCommunicatorService.provide(id);
					if (!communicator) {
						return;
					}
					return communicator.getVisualizer(AnnotationVisualizerType) as AnnotationsVisualizer;
				})
				.filter(visualizer => !!visualizer);

			visualizers.forEach(visualizer => {
				switch (action.payload.action) {
					case 'addLayer':
						visualizer.removeLayer();
						visualizer.addLayer();
						break;
					case 'show':
						visualizer.removeLayer();
						visualizer.addLayer();
						visualizer.removeInteraction();
						visualizer.addSelectInteraction();
						visualizer.drawFeatures(selectedCase.state.layers.annotationsLayer);
						break;
					case 'createInteraction':
						if (action.payload.type === 'Rectangle') {
							visualizer.rectangleInteraction();
						}
						else if (action.payload.type === 'Arrow') {
							visualizer.arrowInteraction();
						}
						else {
							visualizer.createInteraction(action.payload.type);
						}
						break;
					case 'removeInteraction':
						visualizer.removeInteraction();
						visualizer.addSelectInteraction();
						break;
					case 'changeLine':
						visualizer.changeLine(action.payload.value);
						break;
					case 'changeStrokeColor':
						visualizer.changeStroke(action.payload.value);
						break;
					case 'changeFillColor':
						visualizer.changeFill(action.payload.value);
						break;
					case 'refreshDrawing':
						visualizer.drawFeatures(selectedCase.state.layers.annotationsLayer);
						break;
					case 'saveDrawing':
						selectedCase.state.layers.annotationsLayer = visualizer.getGeoJson();
						update = true;
						break;
					case 'endDrawing':
						/*selectedCase.state.annotationsLayer = visualizer.getGeoJson();
						update = true;*/
						visualizer.removeInteraction();
						if (layerState.displayAnnotationsLayer) {
							visualizer.addSelectInteraction();
						} else {
							visualizer.removeLayer();
						}

						break;
					case 'removeLayer':
						if (!layerState.displayAnnotationsLayer) {
							visualizer.removeInteraction();
							visualizer.removeLayer();
						}
						break;
				}
			});

			return { selectedCase, update };
		})
		.filter(({ update }) => update)
		.mergeMap(result => {
			return [
				new UpdateCaseAction(result.selectedCase),
				new SetAnnotationMode(undefined)
			];
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
