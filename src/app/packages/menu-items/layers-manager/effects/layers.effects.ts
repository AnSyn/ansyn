import { ILayerTreeNode } from './../models/layer-tree-node';
import { BeginLayerTreeLoadAction, LayerTreeLoadedAction, LayersActionTypes } from './../actions/layers.actions';
import { DataLayersService, LayersBundle } from '../services/data-layers.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LayersEffects {

    constructor(private actions$: Actions, private dataLayersService: DataLayersService) { }

    @Effect()
    beginLayerTreeLoad$: Observable<LayerTreeLoadedAction> = this.actions$
        .ofType(LayersActionTypes.BEGIN_LAYER_TREE_LOAD)
        .switchMap((action: BeginLayerTreeLoadAction) => {
            return this.dataLayersService.getAllLayersInATree(action.payload.caseId)
                .map((layersBundle: LayersBundle) => {
                    return new LayerTreeLoadedAction({ layers: layersBundle.layers, selectedLayers: layersBundle.selectedLayers });
                });
        }).share();
}
