import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Action, Store } from '@ngrx/store';
import { CasesActionTypes, LoadCaseAction, LoadDefaultCaseAction } from '@ansyn/menu-items/cases';
import { get as _get, isEmpty as _isEmpty, isEqual as _isEqual, isNil as _isNil } from 'lodash';
import { NavigateCaseTriggerAction, RouterActionTypes } from '@ansyn/router';
import { IRouterState } from '@ansyn/router/reducers/router.reducer';
import { SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { Case } from '@ansyn/core/models/case.model';

@Injectable()
export class CasesRouterEffects {

	@Effect()
	onUpdateLocationDefaultCase: Observable<Action> = this.actions$
		.ofType(RouterActionTypes.SET_STATE)
		.map(toPayload)
		.filter(({ caseId }) => _isNil(caseId))
		.withLatestFrom(this.store$.select('cases'), (payload, cases) => [payload, cases])
		.filter(([payload, cases]: [string, ICasesState]) => (_isEmpty(cases.selectedCase) || !_isEqual(cases.selectedCase.id, CasesService.defaultCase.id)))
		.map(([{ queryParams }]) => new LoadDefaultCaseAction(queryParams));

	@Effect()
	onUpdateLocationCase$: Observable<Action> = this.actions$
		.ofType(RouterActionTypes.SET_STATE)
		.map(toPayload)
		.filter(({ caseId }) => !_isNil(caseId))
		.withLatestFrom(this.store$.select('cases'), (payload, cases) => [payload, cases])
		.filter(([payload, cases]) => payload !== _get(cases.selectedCase, 'id'))
		.map(([{ caseId }]) => new LoadCaseAction(caseId));

	@Effect()
	selectCaseUpdateRouter$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.withLatestFrom(this.store$.select('router'), ({ payload }: SelectCaseAction, router: IRouterState): any[] => {
			return [payload, router.caseId];
		})
		.filter(([selectedCase, routerCaseId]) => !_isEqual(selectedCase.id, CasesService.defaultCase.id) && !_isEqual(selectedCase.id, routerCaseId))
		.map(([selectedCase]: [Case]) => new NavigateCaseTriggerAction(selectedCase.id));

	@Effect()
	selectDefaultCaseUpdateRouter$: Observable<any> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.withLatestFrom(this.store$.select('router'), ({ payload }, routerState: IRouterState): any => [payload, routerState])
		.filter(([selectedCase, { caseId, queryParams }]: [Case, IRouterState]) => {
			const caseIdRouterNotEmpty = !_isEmpty(caseId);
			const queryParamsNotEmpty = !_isEmpty(queryParams);
			return _isEqual(selectedCase.id, CasesService.defaultCase.id) && (caseIdRouterNotEmpty || queryParamsNotEmpty);
		})
		.map(() => new NavigateCaseTriggerAction());

	constructor(private actions$: Actions, private store$: Store<any>) {
	}
}
