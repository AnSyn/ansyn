import { Injectable } from '@angular/core';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { CasesActionTypes, LoadCaseAction, LoadDefaultCaseAction } from '@ansyn/menu-items/cases';
import { isEmpty as _isEmpty, isEqual as _isEqual, isNil as _isNil, get as _get } from 'lodash';
import { NavigateCaseTriggerAction, RouterActionTypes } from '@ansyn/router';
import { IRouterState } from '@ansyn/router/reducers/router.reducer';
import { SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { Case } from '@ansyn/core/models/case.model';

@Injectable()
export class CasesRouterEffects {

	/**
	 * @type Effect
	 * @name onUpdateLocationDefaultCase$
	 * @ofType SetStateAction
	 * @filter There is no caseId and no selected case or selected case is not the default case
	 * @dependencies cases
	 * @action LoadDefaultCaseAction
	 */
	@Effect()
	onUpdateLocationDefaultCase$: Observable<LoadDefaultCaseAction> = this.actions$
		.ofType(RouterActionTypes.SET_STATE)
		.map(toPayload)
		.filter(({ caseId }) => _isNil(caseId))
		.withLatestFrom(this.store$.select('cases'), (payload, cases) => [payload, cases])
		.filter(([payload, cases]: [string, ICasesState]) => (_isEmpty(cases.selectedCase) || !_isEqual(cases.selectedCase.id, CasesService.defaultCase.id)))
		.map(([{ queryParams }]) => new LoadDefaultCaseAction(queryParams));

	/**
	 * @type Effect
	 * @name onUpdateLocationCase$
	 * @ofType SetStateAction
	 * @filter There is a caseId and selected case id is not equal to payload
	 * @dependencies cases
	 * @action LoadCaseAction
	 */
	@Effect()
	onUpdateLocationCase$: Observable<LoadCaseAction> = this.actions$
		.ofType(RouterActionTypes.SET_STATE)
		.map(toPayload)
		.filter(({ caseId }) => !_isNil(caseId))
		.withLatestFrom(this.store$.select('cases'), (payload, cases) => [payload, cases])
		.filter(([{ caseId }, cases]) => caseId !== (cases.selectedCase && cases.selectedCase.id))
		.map(([{ caseId }]) => new LoadCaseAction(caseId));

	/**
	 * @type Effect
	 * @name selectCaseUpdateRouter$
	 * @ofType SelectCaseAction
	 * @dependencies router
	 * @filter Selected case ID is not the router's or default's case ID
	 * @action NavigateCaseTriggerAction
	 */
	@Effect()
	selectCaseUpdateRouter$: Observable<NavigateCaseTriggerAction> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.withLatestFrom(this.store$.select('router'), ({ payload }: SelectCaseAction, router: IRouterState): any[] => {
			return [payload, router.caseId];
		})
		.filter(([selectedCase, routerCaseId]) => selectedCase.id !== CasesService.defaultCase.id && selectedCase.id !== routerCaseId)
		.map(([selectedCase]: [Case]) => new NavigateCaseTriggerAction(selectedCase.id));

	/**
	 * @type Effect
	 * @name selectDefaultCaseUpdateRouter$
	 * @ofType SelectCaseAction
	 * @dependencies router
	 * @filter Selected case is default, and router or query not empty
	 * @action NavigateCaseTriggerAction
	 */
	@Effect()
	selectDefaultCaseUpdateRouter$: Observable<NavigateCaseTriggerAction> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.withLatestFrom(this.store$.select('router'), ({ payload }, routerState: IRouterState): any => [payload, routerState])
		.filter(([selectedCase, { caseId, queryParams }]: [Case, IRouterState]) => {
			const caseIdRouterNotEmpty = Boolean(caseId);
			const queryParamsNotEmpty = Boolean(queryParams);
			return selectedCase.id === CasesService.defaultCase.id && (caseIdRouterNotEmpty || queryParamsNotEmpty);
		})
		.map(() => new NavigateCaseTriggerAction());

	constructor(private actions$: Actions, private store$: Store<any>) {
	}
}
