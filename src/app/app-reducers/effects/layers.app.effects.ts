import { LayersActionTypes, LayerTreeLoadedAction, removeParents } from '@ansyn/menu-items/layers-manager';
import { CasesActionTypes, ICasesState, UpdateCaseAction } from '@ansyn/menu-items/cases';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/withLatestFrom';
import { isEmpty } from 'lodash';
import { MapActionTypes, AddMapInstacneAction} from '@ansyn/map-facade';
import { IAppState } from '../';
import { cloneDeep } from 'lodash';

@Injectable()
export class LayersAppEffects {

    @Effect()
    addMapInstance$: Observable<Action> = this.actions$
        .ofType(MapActionTypes.ADD_MAP_INSTANCE)
        .withLatestFrom(this.store$.select("cases"))
        .map(([action, casesState]: [AddMapInstacneAction, ICasesState]) => {  
            return new LayerTreeLoadedAction({ layers: casesState.selected_case.state.dataLayers });
    }).share();

    @Effect()
    updateCaseOnSelectionChange$: Observable<UpdateCaseAction> = this.actions$
        .ofType(LayersActionTypes.SELECT_LEAF_LAYER, LayersActionTypes.UNSELECT_LEAF_LAYER)
		.withLatestFrom(this.store$)       
        .map(([action, appState]: [any, IAppState]) => {
            const layers = cloneDeep(appState.layers.layers);
            const selectedCase = cloneDeep(appState.cases.selected_case);

            removeParents(layers);
            
            selectedCase.state.dataLayers = layers;

            return new UpdateCaseAction(selectedCase);
    }).share();

    constructor(private actions$: Actions, private store$: Store<IAppState>) { }
}
