import { ILayerState } from '../reducers/layers.reducer';
import {
	BeginLayerCollectionLoadAction,
	LayerCollectionLoadedAction,
	LayersActions,
	LayersActionTypes
} from '../actions/layers.actions';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { DataLayersService } from '@ansyn/menu-items/layers-manager/services/data-layers.service';
import { ILayer, LayerType } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { mergeMap } from 'rxjs/operators';
import { SetActiveAnnotationLayer, SetLayerSelection } from '@ansyn/menu-items/layers-manager/actions/layers.actions';


@Injectable()
export class LayersEffects {

	/**
	 * @type Effect
	 * @name beginLayerTreeLoad$
	 * @ofType BeginLayerCollectionLoadAction
	 * @dependencies layers
	 * @action LayerCollectionLoadedAction?, ErrorLoadingLayersAction?
	 */
	@Effect()
	beginLayerTreeLoad$: Observable<LayersActions> = this.actions$
		.pipe(
			ofType<BeginLayerCollectionLoadAction>(LayersActionTypes.BEGIN_LAYER_COLLECTION_LOAD),
			mergeMap(({ payload }) => this.dataLayersService.getAllLayersInATree(payload)),
			mergeMap((layers: ILayer[]) => {
				const annotationLayer = layers.find(({ type }) => type === LayerType.annotation);
				if (annotationLayer) {
					return [
						new LayerCollectionLoadedAction(layers),
						new SetActiveAnnotationLayer(annotationLayer.id)
					];
				}
				const defaultAnnotationLayer = this.dataLayersService.generateAnnotationLayer();

				return [
					new LayerCollectionLoadedAction([defaultAnnotationLayer, ...layers]),
					new SetLayerSelection({ id: defaultAnnotationLayer.id, value: true }),
					new SetActiveAnnotationLayer(defaultAnnotationLayer.id)
				];
			})
		);


	constructor(protected actions$: Actions,
				protected dataLayersService: DataLayersService,
				protected store$: Store<ILayerState>) {
	}
}
