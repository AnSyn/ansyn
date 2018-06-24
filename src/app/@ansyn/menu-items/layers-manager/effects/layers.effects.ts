import { ILayerState } from '../reducers/layers.reducer';
import { LayerCollectionLoadedAction, LayersActions, LayersActionTypes } from '../actions/layers.actions';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { DataLayersService } from '@ansyn/menu-items/layers-manager/services/data-layers.service';
import { ILayer } from '@ansyn/menu-items/layers-manager/models/layers.model';
import { map, mergeMap } from 'rxjs/operators';



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
		.pipe(
			mergeMap(() => this.dataLayersService.getAllLayersInATree()),
			map((layers: ILayer[]) => new LayerCollectionLoadedAction(layers))
		);


	constructor(protected actions$: Actions,
				protected dataLayersService: DataLayersService,
				protected store$: Store<ILayerState>) {
	}
}
