import { ILayerState, layersStateSelector } from '../reducers/layers.reducer';
import {
	BeginLayerTreeLoadAction,
	ErrorLoadingLayersAction,
	LayersActions,
	LayersActionTypes,
	LayerTreeLoadedAction,
	SelectLayerAction,
	UnselectLayerAction
} from '../actions/layers.actions';
import { DataLayersService, Layer, LayersContainer } from '../services/data-layers.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LayersEffects {

	/**
	 * @type Effect
	 * @name beginLayerTreeLoad$
	 * @ofType BeginLayerTreeLoadAction
	 * @dependencies layers
	 * @action UnselectLayerAction?, LayerTreeLoadedAction?, SelectLayerAction?, ErrorLoadingLayersAction?
	 */
	@Effect()
	beginLayerTreeLoad$: Observable<LayersActions> = this.actions$
		.ofType(LayersActionTypes.BEGIN_LAYER_TREE_LOAD)
		.switchMap(() => {
			return this.dataLayersService.getAllLayersInATree();
		})
		.withLatestFrom(this.store.select(layersStateSelector))
		.mergeMap(([layersContainer, layersState]: [LayersContainer, ILayerState]) => {
			let actionsArray = [];

			layersState.layersContainer.layerBundle.selectedLayers.forEach((selectedLayer) => {
				actionsArray.push(new UnselectLayerAction(selectedLayer));
			});

			actionsArray.push(new LayerTreeLoadedAction({
			layersContainer: layersContainer
			}));

			layersContainer.layerBundle.selectedLayers.forEach((layer: Layer) => {
				actionsArray.push(new SelectLayerAction(layer));
			});

			return Observable.from(actionsArray);
		})
		.catch(error => {
			return Observable.of(new ErrorLoadingLayersAction(error));
		})
		.share();

	constructor(protected actions$: Actions,
				protected dataLayersService: DataLayersService,
				protected store: Store<ILayerState>) {
	}
}
