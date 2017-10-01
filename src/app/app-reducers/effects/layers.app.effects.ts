import { BeginLayerTreeLoadAction } from '@ansyn/menu-items/layers-manager/actions/layers.actions';
import { CasesActionTypes } from '@ansyn/menu-items/cases/actions/cases.actions';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { IAppState } from '../';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/withLatestFrom';
import { isEmpty } from 'lodash';
import { SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';

@Injectable()
export class LayersAppEffects {

	@Effect()
	selectCase$: Observable<Action> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.filter(({payload}: SelectCaseAction) => !isEmpty(payload))
		.map(({payload}: SelectCaseAction) => {
			return new BeginLayerTreeLoadAction({ caseId: payload.id });
		}).share();

	constructor(private actions$: Actions, private store$: Store<IAppState>) {
	}
}
