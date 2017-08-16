import { ILayerState } from './../reducers/layers.reducer';
import { ILayerTreeNode, ILayerTreeNodeLeaf } from '@ansyn/core';
import { LayersActions, LayerTreeLoadedAction, LayersActionTypes, SelectLeafLayerAction, UnselectLeafLayerAction, ErrorLoadingLayersAction } from './../actions/layers.actions';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { findNodesByFilterFunc, checkedAndLeafFilterFunc } from '../utils/layers.utils';

@Injectable()
export class LayersEffects {
    @Effect()
    layerTreeLoaded$: Observable<LayersActions> = this.actions$
        .ofType(LayersActionTypes.LAYER_TREE_LOADED)
        .mergeMap((action: LayerTreeLoadedAction) => {
            const actionsArray = [];
            const selectedLayers = findNodesByFilterFunc(action.payload.layers, checkedAndLeafFilterFunc, true);

            selectedLayers.forEach((layer: ILayerTreeNodeLeaf) => {
                actionsArray.push(new SelectLeafLayerAction(layer));
            });

            return Observable.from(actionsArray);
        })
        .catch( error => {
            return Observable.of(new ErrorLoadingLayersAction(error));
        })
        .share();

    constructor(private actions$: Actions,
        private store: Store<ILayerState>) { }
}
