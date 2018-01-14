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
	MapActionTypes, MapInstanceChangedAction
} from '@ansyn/map-facade/actions/map.actions';
import { LayersActionTypes, SetAnnotationsLayer } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { Feature, FeatureCollection } from 'geojson';
import { IVisualizerEntity } from '@ansyn/imagery/index';

export interface AgentOperations {
	[key: string]: (visualizer: AnnotationsVisualizer, payload: AnnotationVisualizerAgentPayload, layerState: ILayerState) => void
}

@Injectable()
export class VisualizersAnnotationsAppEffects {

	agentOperations: AgentOperations = {
		show: (visualizer, {}, { annotationsLayer }) => {
			visualizer.clearEntities();
			const entities = this.annotationsLayerToEntities(annotationsLayer);
			visualizer.setEntities(entities);
		},
		hide: (visualizer, {}, { displayAnnotationsLayer }) => {
			if (!displayAnnotationsLayer) {
				visualizer.clearEntities();
			}
		},
		toggleDrawInteraction: (visualizer, { mode }: AnnotationVisualizerAgentPayload) => {
			visualizer.toggleDrawInteraction(mode);
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
	};

	layersState$ = this.store$.select(layersStateSelector);

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
		.withLatestFrom(this.layersState$, this.store$.select(mapStateSelector))
		.do(([{ payload }, layerState, mapsState]: [AnnotationVisualizerAgentAction, ILayerState, IMapState]) => {
			const { operation, relevantMaps }: AnnotationVisualizerAgentPayload = payload;
			const relevantMapsIds: string[] = this.relevantMapIds(relevantMaps, mapsState);
			const annotationsVisualizers: AnnotationsVisualizer[] = this.annotationVisualizers(relevantMapsIds);
			annotationsVisualizers.forEach(visualizer => {
				this.agentOperations[operation](visualizer, payload, layerState);
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
		.withLatestFrom(this.layersState$)
		.map(([action, { annotationsLayer }]: [AnnotationDrawEndAction, ILayerState]) => {
			const updatedAnnotationsLayer =  <FeatureCollection<any>> { ...annotationsLayer };
			updatedAnnotationsLayer.features.push(action.payload);
			return new SetAnnotationsLayer(updatedAnnotationsLayer)
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
			const updatedAnnotationsLayer = <FeatureCollection<any>> { ...layerState.annotationsLayer } ;
			const featureIndex = updatedAnnotationsLayer.features.findIndex((feature: Feature<any>) => {
				return feature.properties.id === action.payload;
			});
			updatedAnnotationsLayer.features.splice(featureIndex, 1);
			return new SetAnnotationsLayer(updatedAnnotationsLayer);
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
	 * @name changeMode$
	 * @ofType SetAnnotationMode
	 * @action AnnotationVisualizerAgentAction
	 */
	@Effect()
	changeMode$: Observable<any> = this.actions$
		.ofType<Action>(ToolsActionsTypes.STORE.SET_ANNOTATION_MODE)
		.map(({ payload }: SetAnnotationMode) => new AnnotationVisualizerAgentAction({ relevantMaps: 'all', operation: 'toggleDrawInteraction', mode: payload }));

	/**
	 * @type Effect
	 * @name annotationData$
	 * @ofType SetAnnotationsLayer
	 * @action AnnotationVisualizerAgentAction
	 */
	@Effect()
	annotationData$: Observable<any> = this.actions$
		.ofType<SetAnnotationsLayer, MapInstanceChangedAction>(LayersActionTypes.ANNOTATIONS.SET_LAYER, MapActionTypes.MAP_INSTANCE_CHANGED_ACTION)
		.withLatestFrom(this.layersState$.pluck<ILayerState, boolean>('displayAnnotationsLayer'))
		.map(([action, displayAnnotationsLayer]: [SetAnnotationsLayer, boolean]) => {
			const relevantMaps: AnnotationAgentRelevantMap = displayAnnotationsLayer ? 'all' : 'active';
			return new AnnotationVisualizerAgentAction({ operation: 'show', relevantMaps });
		});

	constructor(protected actions$: Actions,
				protected store$: Store<IAppState>,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
	}

	annotationsLayerToEntities(annotationsLayer: FeatureCollection<any>): IVisualizerEntity[] {
		return annotationsLayer.features.map((feature: Feature<any>): IVisualizerEntity => ({
			id: feature.properties.id,
			featureJson: feature,
			style: feature.properties.style
		}));
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
			const annotationVisualizerType = communicator && communicator.getVisualizer(AnnotationVisualizerType);
			const existVisualizer = (communicator && annotationVisualizerType);
			return existVisualizer ? [ ...visualizers, annotationVisualizerType ] : visualizers;
		}, []);
	}
}
