import { ILayerState } from '../reducers/layers.reducer';
import {
	ErrorLoadingLayersAction,
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
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { LayersContainer } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { DataLayersService } from '@ansyn/menu-items/layers-manager/services/data-layers.service';

@Injectable()
export class LayersEffects {

	/**
	 * @type Effect
	 * @name beginLayerTreeLoad$
	 * @ofType BeginLayerCollectionLoadAction
	 * @dependencies layers
	 * @action UnselectLayerAction?, LayerCollectionLoadedAction?, SelectLayerAction?, ErrorLoadingLayersAction?
	 */
	@Effect()
	beginLayerTreeLoad$: Observable<LayersActions> = this.actions$
		.ofType(LayersActionTypes.BEGIN_LAYER_COLLECTION_LOAD)
		.mergeMap(() => this.dataLayersService.getAllLayersInATree())
		.map((layersContainer: LayersContainer[]) => new LayerCollectionLoadedAction(layersContainer))
		.catch(error => Observable.of(new ErrorLoadingLayersAction(error)));

	constructor(protected actions$: Actions,
				protected dataLayersService: DataLayersService,
				protected store: Store<ILayerState>) {
	}
}
