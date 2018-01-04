import { Actions, Effect } from '@ngrx/effects';
import {
	AnnotationAgentRelevantMap, AnnotationVisualizerAgentAction, AnnotationVisualizerAgentPayload,
	SetAnnotationMode, ToolsActionsTypes
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { ILayerState, layersStateSelector } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { AnnotationsVisualizer, AnnotationVisualizerType } from '@ansyn/open-layer-visualizers/annotations.visualizer';
import { Observable } from 'rxjs/Observable';
import { IAppState } from '../../app.effects.module';
import { Action, Store } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { Injectable } from '@angular/core';
import {
	AnnotationDrawEndAction, AnnotationRemoveFeature,
	MapActionTypes
} from '@ansyn/map-facade/actions/map.actions';
import {
	LayersActionTypes,
	SetAnnotationsLayer
} from '@ansyn/menu-items/layers-manager/actions/layers.actions';

export interface AgentOperations {
	[key: string]: (visualizer: AnnotationsVisualizer, payload: AnnotationVisualizerAgentPayload, layerState: ILayerState) => void
}

@Injectable()
export class VisualizersAnnotationsAppEffects {

	agentOperations: AgentOperations = {
		addLayer: (visualizer) => {
			visualizer.removeLayer();
			visualizer.addLayer();
		},
		show: (visualizer, {}, { annotationsLayer }) => {
			visualizer.removeLayer();
			visualizer.addLayer();
			visualizer.removeInteraction();
			visualizer.addSelectInteraction();
			visualizer.drawFeatures(annotationsLayer);
		},
		removeInteraction: (visualizer) => {
			visualizer.removeInteraction();
			visualizer.addSelectInteraction();
		},
		createInteraction: (visualizer, { type }: AnnotationVisualizerAgentPayload) => {
			if (type === 'Rectangle') {
				visualizer.rectangleInteraction();
			}
			else if (type === 'Arrow') {
				visualizer.arrowInteraction();
			}
			else {
				visualizer.createInteraction(type);
			}
		},
		changeLine: (visualizer, { value }: AnnotationVisualizerAgentPayload) => {
			visualizer.changeLine(value);
		},
		changeStrokeColor: (visualizer, { value }: AnnotationVisualizerAgentPayload) => {
			visualizer.changeStroke(value);
		},
		changeFillColor: (visualizer, { value }: AnnotationVisualizerAgentPayload) => {
			visualizer.changeFill(value);
		},
		refreshDrawing: (visualizer, {}, { annotationsLayer }) => {
			visualizer.drawFeatures(annotationsLayer);
		},
		endDrawing: (visualizer, {}, { displayAnnotationsLayer }) => {
			visualizer.removeInteraction();
			if (displayAnnotationsLayer) {
				visualizer.addSelectInteraction();
			} else {
				visualizer.removeLayer();
			}
		},
		removeLayer: (visualizer, {}, { displayAnnotationsLayer }) => {
			if (!displayAnnotationsLayer) {
				visualizer.removeInteraction();
				visualizer.removeLayer();
			}
		}
	};

	/**
	 * @type Effect
	 * @name annotationVisualizerAgent$
	 * @ofType AnnotationVisualizerAgentAction
	 * @dependencies layers, maps
	 * @dispatch: false
	 */
	@Effect({ dispatch: false })
	annotationVisualizerAgent$: Observable<any> = this.actions$
		.ofType<AnnotationVisualizerAgentAction>(ToolsActionsTypes.ANNOTATION_VISUALIZER_AGENT)
		.withLatestFrom(this.store$.select(layersStateSelector), this.store$.select(mapStateSelector))
		.do(([{ payload }, layerState, mapsState]: [AnnotationVisualizerAgentAction, ILayerState, IMapState]) => {
			const { action, maps }: AnnotationVisualizerAgentPayload = payload;
			const relevantMapsIds: string[] = this.relevantMapIds(maps, mapsState);
			const annotationsVisualizers: AnnotationsVisualizer[] = this.annotationVisualizers(relevantMapsIds);
			annotationsVisualizers.forEach(visualizer => {
				this.agentOperations[action](visualizer, payload, layerState);
			});
		});

	/**
	 * @type Effect
	 * @name drawAnnotationEnd$
	 * @ofType AnnotationDrawEndAction
	 * @action SetAnnotationsLayer
	 */
	@Effect()
	drawAnnotationEnd$ = this.actions$
		.ofType<AnnotationDrawEndAction>(MapActionTypes.TRIGGER.ANNOTATION_DRAW_END)
		.map((action: AnnotationDrawEndAction) => new SetAnnotationsLayer(JSON.stringify(action.payload)));

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
		.withLatestFrom(this.store$.select(layersStateSelector))
		.map(([action, layerState]: [AnnotationRemoveFeature, ILayerState]) => {
			const annotationsLayer = JSON.parse(layerState.annotationsLayer);
			const featureIndex = annotationsLayer.features.findIndex(featureString => {
				const feature = JSON.parse(featureString);
				return feature.properties.id === action.payload;
			});
			annotationsLayer.features.splice(featureIndex, 1);
			return new SetAnnotationsLayer(JSON.stringify(annotationsLayer));
		});

	/**
	 * @type Effect
	 * @name cancelAnnotationEditMode$
	 * @ofType SetAnnotationLayer, AnnotationContextMenuTriggerAction, ActiveMapChangedAction
	 * @action SetAnnotationMode
	 */
	@Effect()
	cancelAnnotationEditMode$: Observable<any> = this.actions$
		.ofType<Action>(LayersActionTypes.ANNOTATIONS.SET_LAYER, MapActionTypes.TRIGGER.ANNOTATION_CONTEXT_MENU, MapActionTypes.TRIGGER.ACTIVE_MAP_CHANGED)
		.map(() => new SetAnnotationMode());

	/**
	 * @type Effect
	 * @name annotationData$
	 * @ofType SetAnnotationsLayer
	 * @action AnnotationVisualizerAgentAction
	 */
	@Effect()
	annotationData$: Observable<any> = this.actions$
		.ofType<SetAnnotationsLayer>(LayersActionTypes.ANNOTATIONS.SET_LAYER)
		.withLatestFrom(this.store$.select(layersStateSelector).pluck<ILayerState, boolean>('displayAnnotationsLayer'))
		.map(([action, displayAnnotationsLayer]: [SetAnnotationsLayer, boolean]) => {
			const maps: AnnotationAgentRelevantMap = displayAnnotationsLayer ? 'all' : 'active';
			return new AnnotationVisualizerAgentAction({ action: 'show', maps });
		});

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}

	relevantMapIds(relevantMaps: AnnotationAgentRelevantMap, { mapsList, activeMapId }: IMapState) {
		switch (relevantMaps) {
			case 'all':
				return mapsList.map(({ id }) => id);
			case 'active':
				return [activeMapId];
			case 'others':
				return mapsList.map(({ id }) => id).filter(id => id !== activeMapId);
			default:
				return [];
		}
	}

	annotationVisualizers(ids: string[]): AnnotationsVisualizer[] {
		return ids.reduce((visualizers, id) => {
			const communicator = this.imageryCommunicatorService.provide(id);
			if (!communicator) {
				return visualizers;
			} else {
				return [...visualizers, communicator.getVisualizer(AnnotationVisualizerType)];
			}
		}, []);
	}
}
