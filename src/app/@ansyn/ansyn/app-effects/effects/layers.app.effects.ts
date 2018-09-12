import { Injectable } from '@angular/core';
import 'rxjs/add/operator/withLatestFrom';
import { CasesActionTypes, SaveCaseAsSuccessAction } from '@ansyn/menu-items';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { mergeMap } from 'rxjs/internal/operators';
import { Store } from '@ngrx/store';
import {
	BeginLayerCollectionLoadAction,
	UpdateLayer,
	UpdateSelectedLayersIds
} from '@ansyn/menu-items';
import { selectLayers } from '@ansyn/menu-items';
import { ILayer, LayerType } from '@ansyn/menu-items';
import { Feature } from 'geojson';
import {
	AnnotationRemoveFeature,
	AnnotationUpdateFeature,
	MapActionTypes
} from '@ansyn/map-facade';
import { Observable } from 'rxjs/index';


@Injectable()
export class LayersAppEffects {

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
	removeAnnotationFeature$: Observable<any> = this.actions$
		.ofType<AnnotationRemoveFeature>(MapActionTypes.TRIGGER.ANNOTATION_REMOVE_FEATURE)
		.withLatestFrom(this.store$.select(selectLayers))
		.map(([action, layers]: [AnnotationRemoveFeature, ILayer[]]) => {
			const layer = layers
				.filter(({ type }) => type === LayerType.annotation)
				.find((layer: ILayer) => layer.data.features.some(({ properties }: Feature<any>) => properties.id === action.payload));
			return new UpdateLayer({
				...layer,
				data: {
					...layer.data,
					features: layer.data.features.filter(({ properties }) => properties.id !== action.payload)
				}
			});
		});

	@Effect()
	updateAnnotationFeature$: Observable<any> = this.actions$
		.ofType<AnnotationUpdateFeature>(MapActionTypes.TRIGGER.ANNOTATION_UPDATE_FEATURE)
		.withLatestFrom(this.store$.select(selectLayers))
		.map(([action, layers]: [AnnotationUpdateFeature, ILayer[]]) => {
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
		});

	constructor(protected actions$: Actions,
				protected store$: Store<any>) {

	}
}
