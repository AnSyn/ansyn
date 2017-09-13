import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Action, Store } from '@ngrx/store';
import { Case, CasesActionTypes, LoadCaseAction, LoadDefaultCaseAction } from '@ansyn/menu-items/cases';
import { get as _get, isEmpty as _isEmpty, isEqual as _isEqual, isNil as _isNil } from 'lodash';
import { NavigateCaseTriggerAction, RouterActionTypes } from '@ansyn/router';

@Injectable()
export class CasesRouterEffects {

	@Effect()
	onUpdateLocationDefaultCase: Observable<Action> = this.actions$
		.ofType(RouterActionTypes.SET_STATE)
		.map(toPayload)
		.filter(({ caseId }) => _isNil(caseId))
		.withLatestFrom(this.store$.select('cases'), (payload, cases) => [payload, cases])
		.filter(([payload, cases]) => (_isEmpty(cases.selected_case) || _isEmpty(cases.default_case) || !_isEqual(cases.selected_case.id, cases.default_case.id)))
		.map(([{ queryParams }]) => new LoadDefaultCaseAction(queryParams));

	@Effect()
	onUpdateLocationCase$: Observable<Action> = this.actions$
		.ofType(RouterActionTypes.SET_STATE)
		.map(toPayload)
		.filter(({ caseId }) => !_isNil(caseId))
		.withLatestFrom(this.store$.select('cases'), (payload, cases) => [payload, cases])
		.filter(([payload, cases]) => payload !== _get(cases.selected_case, 'id'))
		.map(([{ caseId }]) => new LoadCaseAction(caseId));

	@Effect()
	selectCaseUpdateRouter$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.withLatestFrom(this.store$.select('cases'), this.store$.select('router'), ({ payload }, cases: any, router: any) => {
			return [payload, _get(cases.default_case, 'id'), router.caseId];
		})
		.filter(([payload, defaultCaseId, routerCaseId]) => !_isEqual(payload, defaultCaseId) && !_isEqual(payload, routerCaseId))
		.map(([payload]) => new NavigateCaseTriggerAction(payload));

	@Effect()
	selectDefaultCaseUpdateRouter$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE_BY_ID)
		.withLatestFrom(this.store$.select('cases').pluck('default_case'), this.store$.select('router').pluck('caseId'),
			({ payload }, default_case: Case, routerCaseId: string): any => [payload, _get(default_case, 'id',), routerCaseId])

		.filter(([payload, defaultCaseId, routerCaseId]) => _isEqual(payload, defaultCaseId) && !_isEmpty(routerCaseId))
		.map(() => new NavigateCaseTriggerAction());

	constructor(private actions$: Actions, private store$: Store<any>) {
	}
}
