import { ILayerState } from '../reducers/layers.reducer';
import {
	LayerCollectionLoadedAction,
	LayersActions,
	LayersActionTypes,
	SelectLayerAction,
	UnselectLayerAction
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
import { DataLayersService } from '@ansyn/menu-items/layers-manager/services/data-layers.service';
import { selectSelectedLayersIds } from '@ansyn/menu-items/layers-manager/reducers/layers.reducer';
import { Layer } from '@ansyn/menu-items/layers-manager/models/layers.model';

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
		.ofType(LayersActionTypes.BEGIN_LAYER_COLLECTION_LOAD)
		.mergeMap(() => this.dataLayersService.getAllLayersInATree())
		.withLatestFrom(this.store$.select(selectSelectedLayersIds))
		.mergeMap(([layers, ids]: [Layer[], string[]]) => {
			this.store$.dispatch(new LayerCollectionLoadedAction(layers));
			let results = [];
			layers.forEach((layerCollection: any) => {
				if (ids.includes(layerCollection.id)) {
					results.push(new SelectLayerAction(layerCollection));
				} else {
					results.push(new UnselectLayerAction(layerCollection));
				}
			});
			return results;
		});

	constructor(protected actions$: Actions,
				protected dataLayersService: DataLayersService,
				protected store$: Store<ILayerState>) {
	}
}
