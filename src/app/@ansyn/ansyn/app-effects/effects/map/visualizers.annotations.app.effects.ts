import { Actions, Effect } from '@ngrx/effects';
import {
	AnnotationAgentRelevantMap,
	AnnotationSetProperties,
	AnnotationVisualizerAgentAction,
	AnnotationVisualizerAgentPayload,
	SetAnnotationMode,
	ToolsActionsTypes
} from '@ansyn/menu-items/tools/actions/tools.actions';
import { IMapState, mapStateSelector } from '@ansyn/map-facade/reducers/map.reducer';
import { ILayerState, layersStateSelector } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { AnnotationsVisualizer } from '@ansyn/plugins/openlayers/visualizers/tools/annotations.visualizer';
import { Observable } from 'rxjs/Observable';
import { IAppState } from '../../app.effects.module';
import { Action, Store } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { Injectable } from '@angular/core';
import {
	AnnotationRemoveFeature,
	MapActionTypes,
	MapInstanceChangedAction
} from '@ansyn/map-facade/actions/map.actions';
import { LayersActionTypes, SetAnnotationsLayer } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { Feature, FeatureCollection } from 'geojson';
import { IToolsState, toolsFlags, toolsStateSelector } from '@ansyn/menu-items';

export interface AgentOperations {
	[key: string]: (visualizer: AnnotationsVisualizer, payload: AnnotationVisualizerAgentPayload, layerState: ILayerState) => void
}

@Injectable()
export class VisualizersAnnotationsAppEffects {
	layersState$ = this.store$.select(layersStateSelector);
	toolsState$ = this.store$.select(toolsStateSelector);

	agentOperations: AgentOperations = {
		show: (visualizer, {}, { annotationsLayer }) => {
			const entities = AnnotationsVisualizer.annotationsLayerToEntities(annotationsLayer);
			return visualizer.setEntities(entities);
		},
		hide: (visualizer, {}, { displayAnnotationsLayer }) => {
			if (!displayAnnotationsLayer) {
				visualizer.clearEntities();
			}

			return Observable.of(true);
		},
		toggleDrawInteraction: (visualizer, { mode }: AnnotationVisualizerAgentPayload) => {
			visualizer.toggleDrawInteraction(mode);
			return Observable.of(true);
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
		.withLatestFrom(this.layersState$, this.store$.select(mapStateSelector))
		.mergeMap(([action, layerState, mapsState]: [AnnotationVisualizerAgentAction, ILayerState, IMapState]) => {
			const { operation, relevantMaps }: AnnotationVisualizerAgentPayload = action.payload;
			const relevantMapsIds: string[] = this.relevantMapIds(relevantMaps, mapsState);
			const annotationsVisualizers: AnnotationsVisualizer[] = this.annotationVisualizers(relevantMapsIds);

			const observables = [];
			annotationsVisualizers.forEach(visualizer => {
				observables.push(this.agentOperations[operation](visualizer, action.payload, layerState));
			});

			return Observable.forkJoin(observables).map(() => [action, layerState, mapsState]);
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
		.map(({ payload }: SetAnnotationMode) => new AnnotationVisualizerAgentAction({
			relevantMaps: 'all',
			operation: 'toggleDrawInteraction',
			mode: payload
		}));

	/**
	 * @type Effect
	 * @name annotationData$
	 * @ofType SetAnnotationsLayer,ImageryCreatedAction,MapInstanceChangedAction
	 * @action AnnotationVisualizerAgentAction
	 */
	@Effect()
	annotationData$: Observable<any> = this.actions$
		.ofType<SetAnnotationsLayer | MapInstanceChangedAction>(LayersActionTypes.ANNOTATIONS.SET_LAYER, MapActionTypes.IMAGERY_PLUGINS_INITIALIZED)
		.withLatestFrom(this.layersState$.pluck<ILayerState, boolean>('displayAnnotationsLayer'), this.toolsState$)
		.filter(([action, displayAnnotationsLayer, { flags }]: [Action, boolean, IToolsState]) => displayAnnotationsLayer || flags.get(toolsFlags.annotations))
		.map(([action, displayAnnotationsLayer]: [Action, boolean, IToolsState]) => {
			const relevantMaps: AnnotationAgentRelevantMap = displayAnnotationsLayer ? 'all' : 'active';
			return new AnnotationVisualizerAgentAction({ operation: 'show', relevantMaps });
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
			const annotationVisualizerType = communicator && communicator.getPlugin<AnnotationsVisualizer>(AnnotationsVisualizer);
			const existVisualizer = (communicator && annotationVisualizerType);
			return existVisualizer ? [...visualizers, annotationVisualizerType] : visualizers;
		}, []);
	}
}
