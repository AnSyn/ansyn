import { Injectable } from '@angular/core';
import { Actions, Effect, ofType, createEffect } from '@ngrx/effects';
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
			this.loggerService.info(action.payload ? JSON.stringify(action.payload) : '', 'Layers', action.type);
		}));

	onSaveCaseAs$ = createEffect(() => this.actions$
		.pipe(
			ofType(SaveCaseAsSuccessAction),
			mergeMap(payload => [
					BeginLayerCollectionLoadAction({ caseId: payload.id }),
					UpdateSelectedLayersIds({payload: payload.state.layers.activeLayersIds})
				]
			))
		);

	removeAnnotationFeature$ = createEffect(() => this.actions$.pipe(
		ofType(AnnotationRemoveFeature),
		withLatestFrom(this.store$.select(selectLayers)),
		mergeMap(([payload, layers]: [{payload: string}, ILayer[]]) => {
			const layer = layers
				.filter(({ type }) => type === LayerType.annotation)
				.find((layer: ILayer) => layer.data.features.some(({ properties }: Feature<any>) => properties.id === payload.payload));
			if (layer) {
				return of(UpdateLayer({ payload: {
						...layer,
						data: {
							...layer.data,
							features: layer.data.features.filter(({ properties }) => properties.id !== payload.payload)
						}
					}
				}));
			}
			return EMPTY;
		}))
	);

	updateAnnotationFeature$ = createEffect(() => this.actions$.pipe(
		ofType(AnnotationUpdateFeature),
		withLatestFrom(this.store$.select(selectLayers)),
		map(([{payload}, layers]: [any, ILayer[]]) => {
			const layer = layers
				.filter(({ type }) => type === LayerType.annotation)
				.find((layer: ILayer) => layer.data.features.some(({ properties }: Feature<any>) => properties.id === payload.payload.featureId));
			return UpdateLayer({payload: {
				...layer,
					data: {
						...layer.data,
						features: layer.data.features.map((feature) => feature.properties.id === payload.payload.featureId ?
							{ ...feature, properties: { ...feature.properties, ...payload.properties } } :
							feature)
					}
				}
			});
		}))
	);

	constructor(protected actions$: Actions,
				protected store$: Store<any>,
				protected loggerService: LoggerService) {

	}
}
