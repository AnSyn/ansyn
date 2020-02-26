import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Feature } from 'geojson';
import { EMPTY, Observable, of } from 'rxjs';
import {
	BeginLayerCollectionLoadAction,
	LayersActionTypes,
	UpdateLayer,
	UpdateSelectedLayersIds
} from '../../modules/menu-items/layers-manager/actions/layers.actions';
import { CasesActionTypes, SaveCaseAsSuccessAction } from '../../modules/menu-items/cases/actions/cases.actions';
import { ILayer, LayerType } from '../../modules/menu-items/layers-manager/models/layers.model';
import { selectLayers } from '../../modules/menu-items/layers-manager/reducers/layers.reducer';
import {
	AnnotationRemoveFeature,
	AnnotationUpdateFeature,
	ToolsActionsTypes
} from '../../modules/menu-items/tools/actions/tools.actions';
import { LoggerService } from '../../modules/core/services/logger.service';


@Injectable()
export class LayersAppEffects {

	@Effect({ dispatch: false })
	actionsLogger$: Observable<any> = this.actions$.pipe(
		ofType(
			LayersActionTypes.ADD_LAYER,
			LayersActionTypes.ADD_LAYER_ON_BACKEND_FAILED_ACTION,
			LayersActionTypes.ADD_LAYER_ON_BACKEND_SUCCESS_ACTION,
			LayersActionTypes.REMOVE_LAYER,
			LayersActionTypes.REMOVE_LAYER_ON_BACKEND_FAILED_ACTION,
			LayersActionTypes.REMOVE_LAYER_ON_BACKEND_SUCCESS_ACTION,
			LayersActionTypes.UPDATE_LAYER,
			LayersActionTypes.UPDATE_LAYER_ON_BACKEND_FAILED_ACTION,
			LayersActionTypes.UPDATE_LAYER_ON_BACKEND_SUCCESS_ACTION,
			LayersActionTypes.BEGIN_LAYER_COLLECTION_LOAD,
			LayersActionTypes.LAYER_COLLECTION_LOADED,
			LayersActionTypes.ERROR_LOADING_LAYERS,
			LayersActionTypes.SET_ACTIVE_ANNOTATION_LAYER,
			LayersActionTypes.SET_LAYER_SELECTION,
			LayersActionTypes.REMOVE_CASE_LAYERS_FROM_BACKEND_ACTION,
			LayersActionTypes.REMOVE_CASE_LAYERS_FROM_BACKEND_FAILED_ACTION,
			LayersActionTypes.REMOVE_CASE_LAYERS_FROM_BACKEND_SUCCESS_ACTION
		),
		tap((action) => {
			this.loggerService.info(action.payload, 'Layers', action.type);
		}));

	@Effect()
	onSaveCaseAs$ = this.actions$
		.pipe(
			ofType<SaveCaseAsSuccessAction>(CasesActionTypes.SAVE_CASE_AS_SUCCESS),
			mergeMap((action: SaveCaseAsSuccessAction) => [
					new BeginLayerCollectionLoadAction({ caseId: action.payload.id }),
					new UpdateSelectedLayersIds(action.payload.state.layers.activeLayersIds)
				]
			)
		);

	@Effect()
	removeAnnotationFeature$: Observable<any> = this.actions$.pipe(
		ofType<AnnotationRemoveFeature>(ToolsActionsTypes.ANNOTATION_REMOVE_FEATURE),
		withLatestFrom(this.store$.select(selectLayers)),
		mergeMap(([action, layers]: [AnnotationRemoveFeature, ILayer[]]) => {
			const layer = layers
				.filter(({ type }) => type === LayerType.annotation)
				.find((layer: ILayer) => layer.data.features.some(({ properties }: Feature<any>) => properties.id === action.payload));
			if (layer) {
				return of(new UpdateLayer({
					...layer,
					data: {
						...layer.data,
						features: layer.data.features.filter(({ properties }) => properties.id !== action.payload)
					}
				}));
			}
			return EMPTY;
		})
	);

	@Effect()
	updateAnnotationFeature$: Observable<any> = this.actions$.pipe(
		ofType<AnnotationUpdateFeature>(ToolsActionsTypes.ANNOTATION_UPDATE_FEATURE),
		withLatestFrom(this.store$.select(selectLayers)),
		map(([action, layers]: [AnnotationUpdateFeature, ILayer[]]) => {
			const layer = layers
				.filter(({ type }) => type === LayerType.annotation)
				.find((layer: ILayer) => layer.data.features.some(({ properties }: Feature<any>) => properties.id === action.payload.featureId));
			return new UpdateLayer({
				...layer,
				data: {
					...layer.data,
					features: layer.data.features.map((feature) => feature.properties.id === action.payload.featureId ?
						{ ...feature, properties: { ...feature.properties, ...action.payload.properties } } :
						feature)
				}
			});
		})
	);

	constructor(protected actions$: Actions,
				protected store$: Store<any>,
				protected loggerService: LoggerService) {

	}
}
