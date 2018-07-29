import { ILayerState } from '../reducers/layers.reducer';
import {
	BeginLayerCollectionLoadAction, LayerCollectionLoadedAction, LayersActions,
	LayersActionTypes
} from '../actions/layers.actions';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { DataLayersService } from '@ansyn/menu-items/layers-manager/services/data-layers.service';
import { ILayer, LayerType } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { mergeMap } from 'rxjs/operators';
import { SetLayerSelection } from '@ansyn/menu-items/layers-manager/actions/layers.actions';



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
				if ( layers.some(({ type }) => type === LayerType.annotation) ) {
					return [
						new LayerCollectionLoadedAction(layers)
					]
				}
				const defaultAnnotationLayer = this.dataLayersService.generateAnnotationLayer();
				return [
					new LayerCollectionLoadedAction([ defaultAnnotationLayer, ...layers ]),
					new SetLayerSelection({ id: defaultAnnotationLayer.id, value: true })
				];

			})
		);


	constructor(protected actions$: Actions,
				protected dataLayersService: DataLayersService,
				protected store$: Store<ILayerState>) {
	}
}
