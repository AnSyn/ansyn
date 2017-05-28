import { BeginLayerTreeLoadAction } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { CasesActionTypes, SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { IAppState } from '../';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/withLatestFrom';

@Injectable()
export class LayersAppEffects {

    constructor(private actions$: Actions, private store$: Store<IAppState>) { }

    @Effect()
    selectCase$: Observable<Action> = this.actions$
        .ofType(CasesActionTypes.SELECT_CASE)
        .map((action: SelectCaseAction) => {
            return new BeginLayerTreeLoadAction({ caseId: action.payload })
        }).share();

}
