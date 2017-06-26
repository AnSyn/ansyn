import { ILayerState } from './../reducers/layers.reducer';
import { ILayerTreeNodeLeaf } from './../models/layer-tree-node-leaf';
import { ILayerTreeNode } from './../models/layer-tree-node';
import { LayersActions, BeginLayerTreeLoadAction, LayerTreeLoadedAction, LayersActionTypes, SelectLayerAction, UnselectLayerAction, ErrorLoadingLayersAction } from './../actions/layers.actions';
import { DataLayersService, LayerRootsBundle } from '../services/data-layers.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LayersEffects {
    @Effect()
    beginLayerTreeLoad$: Observable<LayersActions> = this.actions$
        .ofType(LayersActionTypes.BEGIN_LAYER_TREE_LOAD)
        .switchMap((action: BeginLayerTreeLoadAction) => {
            return this.dataLayersService.getAllLayersInATree(action.payload.caseId);
        })
        .withLatestFrom(this.store.select("layers"))
        .mergeMap(([layersBundle, store]: [LayerRootsBundle, ILayerState]) => {
            let actionsArray = [];

            store.selectedLayers.forEach((selectedLayer) => {
                actionsArray.push(new UnselectLayerAction(selectedLayer));
            });

            actionsArray.push(new LayerTreeLoadedAction({ layers: layersBundle.layers, selectedLayers: layersBundle.selectedLayers }));
            
            layersBundle.selectedLayers.forEach((layer: ILayerTreeNodeLeaf) => {
                actionsArray.push(new SelectLayerAction(layer));
            });
            
            return Observable.from(actionsArray);
        })
        .catch( error => {
            return Observable.of(new ErrorLoadingLayersAction(error));
        })
        .share();

    constructor(private actions$: Actions,
        private dataLayersService: DataLayersService,
        private store: Store<ILayerState>) { }
}
