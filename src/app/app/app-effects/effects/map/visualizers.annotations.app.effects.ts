import { Actions, Effect } from '@ngrx/effects';
import {
	AnnotationAgentRelevantMap, AnnotationVisualizerAgentAction, AnnotationVisualizerAgentPayload, SetAnnotationMode,
	ToolsActionsTypes
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { ILayerState, layersStateSelector } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { Case, CaseMapState } from '@ansyn/core/models/case.model';
import { AnnotationsVisualizer, AnnotationVisualizerType } from '@ansyn/open-layer-visualizers/annotations.visualizer';
import { UpdateCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Observable } from 'rxjs/Observable';
import { casesStateSelector, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { IAppState } from '../../app.effects.module';
import { Store } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { Injectable } from '@angular/core';
import {
	AnnotationContextMenuTriggerAction,
	AnnotationData, AnnotationRemoveFeature,
	MapActionTypes
} from '@ansyn/map-facade/actions/map.actions';

@Injectable()
export class VisualizersAnnotationsAppEffects {

	agentOperations = {
		addLayerd: (visualizer) => {
			visualizer.removeLayer();
			visualizer.addLayer();
		},
		show: (visualizer, {}, annotationsLayer) => {
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
		refreshDrawing: (visualizer, {}, annotationsLayer) => {
			visualizer.drawFeatures(annotationsLayer);
		},
		endDrawing: (visualizer, {}, {}, layerState) => {
			visualizer.removeInteraction();
			if (layerState.displayAnnotationsLayer) {
				visualizer.addSelectInteraction();
			} else {
				visualizer.removeLayer();
			}
		},
		removeLayer: (visualizer, {}, {}, layerState) => {
			if (!layerState.displayAnnotationsLayer) {
				visualizer.removeInteraction();
				visualizer.removeLayer();
			}
		}
	};

	/**
	 * @type Effect
	 * @name annotationVisualizerAgent$
	 * @ofType AnnotationVisualizerAgentAction
	 * @dependencies cases, layers
	 * @action UpdateCaseAction?, SetAnnotationMode?
	 */
	@Effect({ dispatch: false })
	annotationVisualizerAgent$: Observable<any> = this.actions$
		.ofType<AnnotationVisualizerAgentAction>(ToolsActionsTypes.ANNOTATION_VISUALIZER_AGENT)
		.withLatestFrom(this.store$.select(casesStateSelector), this.store$.select(layersStateSelector), this.store$.select(mapStateSelector))
		.do(([{ payload }, casesState, layerState, mapsState]: [AnnotationVisualizerAgentAction, ICasesState, ILayerState, IMapState]) => {
			const { action, maps } = payload;
			const { activeMapId, mapsList } = mapsState;
			const relevantMapsIds: string[] = this.relevantMapIds(maps, mapsList, activeMapId);
			const annotationsVisualizers: AnnotationsVisualizer[] = this.annotationVisualizers(relevantMapsIds);
			const { annotationsLayer } = casesState.selectedCase.state.layers;
			annotationsVisualizers.forEach(visualizer => {
				this.agentOperations[action](visualizer, payload, annotationsLayer, layerState);
			});
		});

	/**
	 * @type Effect
	 * @name removeFeature$
	 * @ofType AnnotationRemoveFeature
	 * @action AnnotationData
	 */
	@Effect()
	removeFeature$: Observable<AnnotationData> = this.actions$
		.ofType<AnnotationRemoveFeature>(MapActionTypes.STORE.ANNOTATION_REMOVE_FEATURE)
		.withLatestFrom(this.store$.select(casesStateSelector))
		.map(([action, casesState]: [AnnotationRemoveFeature, ICasesState]) => {
			const annotationsLayer = JSON.parse(casesState.selectedCase.state.layers.annotationsLayer);
			const featureIndex = annotationsLayer.features.findIndex(featureString => {
				const feature = JSON.parse(featureString);
				return feature.properties.id === action.payload;
			});
			annotationsLayer.features.splice(featureIndex, 1);
			return new AnnotationData(annotationsLayer)
		});

	/**
	 * @type Effect
	 * @name annotationData$
	 * @ofType AnnotationData
	 * @action UpdateCaseAction, AnnotationVisualizerAgentAction
	 */
	@Effect()
	cancelAnnotationEditMode$: Observable<any> = this.actions$
		.ofType<AnnotationContextMenuTriggerAction>(MapActionTypes.STORE.ANNOTATION_DATA, MapActionTypes.TRIGGER.ANNOTATION_CONTEXT_MENU)
		.map(() => new SetAnnotationMode());

	/**
	 * @type Effect
	 * @name annotationData$
	 * @ofType AnnotationData
	 * @action UpdateCaseAction, AnnotationVisualizerAgentAction
	 */
	@Effect()
	annotationData$: Observable<any> = this.actions$
		.ofType<AnnotationData>(MapActionTypes.STORE.ANNOTATION_DATA)
		.withLatestFrom(this.store$.select(casesStateSelector))
		.mergeMap(([action, casesState]: [AnnotationData, ICasesState]) => {
			const updatedCase: Case = { ...casesState.selectedCase };
			updatedCase.state.layers.annotationsLayer = JSON.stringify(action.payload);
			return [
				new UpdateCaseAction(updatedCase),
				new AnnotationVisualizerAgentAction({maps: 'all', action: 'show'})
			];
		});

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}

	relevantMapIds(relevantMaps: AnnotationAgentRelevantMap, mapsList: CaseMapState[], activeMapId: string) {
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
