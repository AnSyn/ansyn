import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Feature } from 'geojson';
import { EMPTY, Observable, of } from 'rxjs';
import {
	BeginLayerCollectionLoadAction,
	UpdateLayer,
	UpdateSelectedLayersIds
} from '../../modules/menu-items/layers-manager/actions/layers.actions';
import { ILayer, LayerType } from '../../modules/menu-items/layers-manager/models/layers.model';
import { selectLayers } from '../../modules/menu-items/layers-manager/reducers/layers.reducer';
import {
	AnnotationRemoveFeature,
	AnnotationUpdateFeature,
	ToolsActionsTypes
} from '../../modules/status-bar/components/tools/actions/tools.actions';

@Injectable()
export class LayersAppEffects {

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
						{ ...feature, properties: { ...feature.properties, ...action.payload.properties, featureJson: undefined } } :
						feature)
				}
			});
		})
	);

	constructor(
		protected actions$: Actions,
		protected store$: Store<any>
	) {
	}
}
