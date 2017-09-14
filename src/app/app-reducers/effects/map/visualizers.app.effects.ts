import { Actions, Effect, toPayload } from '@ngrx/effects';
import {
	DrawOverlaysOnMapTriggerAction,
	HoverFeatureTriggerAction,
	MapActionTypes,
	SetMapsDataActionStore
} from '@ansyn/map-facade/actions/map.actions';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { IAppState } from '../../app-reducers.module';
import { Action, Store } from '@ngrx/store';
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
import { IOverlayState } from '@ansyn/overlays/reducers/overlays.reducer';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { IVisualizerEntity } from '@ansyn/imagery/model/imap-visualizer';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { FootprintHitmapVisualizerType } from '@ansyn/open-layer-visualizers/overlays/hitmap-visualizer';
import { cloneDeep as _cloneDeep } from 'lodash';
import { ToolsActionsTypes } from '@ansyn/menu-items/tools/actions/tools.actions';
import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';

import { AnnotationsVisualizer, AnnotationVisualizerType } from '@ansyn/open-layer-visualizers/annotations.visualizer';
import { MapFacadeService } from '@ansyn/map-facade/services/map-facade.service';
import { IMapState } from '@ansyn/map-facade/reducers/map.reducer';

@Injectable()
export class VisualizersAppEffects {

	@Effect()
	onHoverFeatureSetMarkup$: Observable<any> = this.actions$
		.ofType(MapActionTypes.VISUALIZERS.HOVER_FEATURE)
		.withLatestFrom(this.store$.select('cases').pluck('selected_case'))
		.map(([action, selectedCase]: [HoverFeatureTriggerAction, Case]) => {
			const markups = CasesService.getOverlaysMarkup(selectedCase, action.payload.id);
			return new OverlaysMarkupAction(markups);
		});

	@Effect()
	onMouseOverDropAction$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.MOUSE_OVER_DROP, OverlaysActionTypes.MOUSE_OUT_DROP)
		.map((action: MouseOverDropAction | MouseOutDropAction) => action instanceof MouseOverDropAction ? action.payload : undefined)
		.map((payload: string | undefined) => new HoverFeatureTriggerAction({
			id: payload,
			visualizerType: FootprintPolylineVisualizerType
		}));

	@Effect({dispatch: false})
	onHoverFeatureEmitSyncHoverFeature$: Observable<void> = this.actions$
		.ofType(MapActionTypes.VISUALIZERS.HOVER_FEATURE)
		.map((action): void => {
			this.imageryCommunicatorService.communicatorsAsArray().forEach((communicator: CommunicatorEntity) => {
				const visualizer = communicator.getVisualizer(FootprintPolylineVisualizerType);
				if (visualizer) {
					visualizer.setHoverFeature(action.payload.id);
				}
			});
		});

	@Effect()
	onDbclickFeaturePolylineDisplayAction$: Observable<any> = this.actions$
		.ofType(MapActionTypes.VISUALIZERS.DBCLICK_FEATURE)
		.map(toPayload)
		.filter(({visualizerType}) => visualizerType === FootprintPolylineVisualizerType)
		.map(({id}) => new DisplayOverlayFromStoreAction({id}));

	@Effect({dispatch: false})
	markupVisualizer$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.OVERLAYS_MARKUPS)
		.map((action: OverlaysMarkupAction) => {
			this.imageryCommunicatorService.communicatorsAsArray().forEach((communicator: CommunicatorEntity) => {
				const footprintPolyline = <FootprintPolylineVisualizer>communicator.getVisualizer(FootprintPolylineVisualizerType);
				if (footprintPolyline) {
					footprintPolyline.setMarkupFeatures(action.payload);
				}
			});
		});

	@Effect()
	updateCaseFromTools$: Observable<any> = this.actions$
		.ofType(ToolsActionsTypes.SHOW_OVERLAYS_FOOTPRINT)
		.map(toPayload)
		.withLatestFrom(this.store$.select('map'))
		.mergeMap(([payload, mapState]: [OverlayDisplayMode, IMapState]) => {
			const mapsList = [...mapState.mapsList];
			const activeMap = MapFacadeService.activeMap(mapState);
			activeMap.data.overlayDisplayMode = payload;
			return [
				new SetMapsDataActionStore({ mapsList }),
				new DrawOverlaysOnMapTriggerAction()
			];
		});


	@Effect()
	shouldDrawOverlaysOnMap$: Observable<any> = this.actions$
		.ofType(OverlaysActionTypes.SET_FILTERS, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
		.map((action) => new DrawOverlaysOnMapTriggerAction());

	@Effect({dispatch: false})
	drawOverlaysOnMap$: Observable<void> = this.actions$
		.ofType(MapActionTypes.DRAW_OVERLAY_ON_MAP)
		.withLatestFrom(this.store$.select('overlays'), this.store$.select('cases'), (action, overlaysState: IOverlayState, casesState: ICasesState) => {
			return [overlaysState, casesState.selected_case];
		})
		.map(([overlaysState, selectedCase]: [IOverlayState, Case]) => {
			selectedCase.state.maps.data.forEach((mapData: CaseMapState) => {
				this.drawOverlaysOnMap(mapData, overlaysState);
			});
		});

	@Effect()
	annotationVisualizerAgent$: Observable<any> = this.actions$
		.ofType(ToolsActionsTypes.ANNOTATION_VISUALIZER_AGENT)
		.withLatestFrom(this.store$.select('cases'))

		.map(([action, cases]: [Action, ICasesState]) => {
			const selectedCase: Case = _cloneDeep(cases.selected_case);
			let update = false;
			let releventMapsIds = [];

			// we also need to add specific ids for maps that the layers are disabled or
			// I can check that in the maps == all in the state of the map instance
			if (action.payload.maps === 'all') {
				releventMapsIds = selectedCase.state.maps.data.map(m => m.id);
			}
			else if (action.payload.maps === 'active') {
				releventMapsIds.push(selectedCase.state.maps.active_map_id);
			}
			else if (action.payload.maps === 'others') {
				releventMapsIds = selectedCase.state.maps.data.filter(m => m.id !== selectedCase.state.maps.active_map_id)
					.map(m => m.id);
			}
			else {
				return;
			}


			const visualizers = releventMapsIds
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
						visualizer.addLayer();
						break;
					case 'show':
						visualizer.addLayer();
						visualizer.removeInteraction();
						visualizer.drawFeatures(selectedCase.state.annotationsLayer);
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
						visualizer.drawFeatures(selectedCase.state.annotationsLayer);
						break;
					case 'saveDrawing':
						selectedCase.state.annotationsLayer = visualizer.getGeoJson();
						update = true;
						break;
					case 'endDrawing':
						/*selectedCase.state.annotationsLayer = visualizer.getGeoJson();
						update = true;*/
						visualizer.removeInteraction();
						break;
					case 'removeLayer': {
						visualizer.removeInteraction();
						visualizer.removeLayer();
						break;
					}
				}
			});

			return {selectedCase, update};
		})
		.filter(result => result.update)
		.map(result => {
			return new UpdateCaseAction(result.selectedCase);
		});


	constructor(private actions$: Actions,
				private store$: Store<IAppState>,
				private imageryCommunicatorService: ImageryCommunicatorService) {
	}

	drawOverlaysOnMap(mapData: CaseMapState, overlayState: IOverlayState) {
		const communicator = this.imageryCommunicatorService.provide(mapData.id);
		if (communicator && mapData.data.overlayDisplayMode) {
			const polylineVisualizer = communicator.getVisualizer(FootprintPolylineVisualizerType);
			const hitMapvisualizer = communicator.getVisualizer(FootprintHitmapVisualizerType);
			if (!polylineVisualizer || !hitMapvisualizer) {
				return;
			}
			const overlayDisplayMode: OverlayDisplayMode = mapData.data.overlayDisplayMode;
			switch (overlayDisplayMode) {
				case 'Hitmap': {
					const entitiesToDraw = this.getEntitiesToDraw(overlayState);
					hitMapvisualizer.setEntities(entitiesToDraw);
					polylineVisualizer.clearEntities();
					break;
				}
				case 'Polygon': {
					const entitiesToDraw = this.getEntitiesToDraw(overlayState);
					polylineVisualizer.setEntities(entitiesToDraw);
					hitMapvisualizer.clearEntities();
					break;
				}
				case 'None':
				default: {
					polylineVisualizer.clearEntities();
					hitMapvisualizer.clearEntities();
				}
			}
		}
	}

	getEntitiesToDraw(overlayState: IOverlayState): IVisualizerEntity[] {
		const overlaysToDraw = <any[]> OverlaysService.pluck(overlayState.overlays, overlayState.filteredOverlays, ['id', 'footprint']);
		return overlaysToDraw.map(({id, footprint}) => {
			const featureJson: GeoJSON.Feature<any> = {
				type: 'Feature',
				geometry: footprint,
				properties: {}
			};
			return {id, featureJson};
		});
	}

}
