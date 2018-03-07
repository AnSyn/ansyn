import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { CasesActionTypes, LoadCaseAction, LoadDefaultCaseAction } from '@ansyn/menu-items/cases';
import { NavigateCaseTriggerAction, RouterActionTypes, SetStateAction } from '@ansyn/router';
import { IRouterState, routerStateSelector } from '@ansyn/router/reducers/router.reducer';
import { SaveCaseAsSuccessAction, SelectCaseAction } from '@ansyn/menu-items/cases/actions/cases.actions';
import { casesStateSelector, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { Case } from '@ansyn/core/models/case.model';
import { ISetStatePayload } from '@ansyn/router/actions/router.actions';

@Injectable()
export class RouterAppEffects {

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
		.ofType<SetStateAction>(RouterActionTypes.SET_STATE)
		.filter((action) => !(action.payload.caseId))
		.withLatestFrom(this.store$.select(casesStateSelector))
		.filter(([action, cases]: [SetStateAction, ICasesState]) => (!cases.selectedCase || cases.selectedCase.id !== this.casesService.defaultCase.id))
		.map(([action, cases]) => new LoadDefaultCaseAction(action.payload.queryParams));

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
		.ofType<SetStateAction>(RouterActionTypes.SET_STATE)
		.map(({ payload }): ISetStatePayload => payload)
		.filter(({ caseId }) => Boolean(caseId))
		.withLatestFrom(this.store$.select(casesStateSelector))
		.filter(([{ caseId }, cases]) => !cases.selectedCase || caseId !== cases.selectedCase.id)
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
		.ofType(CasesActionTypes.SELECT_CASE, CasesActionTypes.SAVE_CASE_AS_SUCCESS)
		.withLatestFrom(this.store$.select(routerStateSelector), ({ payload }: (SelectCaseAction | SaveCaseAsSuccessAction), router: IRouterState): any[] => {
			return [payload, router.caseId];
		})
		.filter(([selectedCase, routerCaseId]) => selectedCase.id !== this.casesService.defaultCase.id && selectedCase.id !== routerCaseId)
		.map(([selectedCase]: [Case]) => new NavigateCaseTriggerAction(selectedCase.id));

	/**
	 * @type Effect
	 * @name selectCaseUpdateRouter$
	 * @ofType SelectCaseAction
	 * @dependencies router
	 * @filter Selected case ID is not the router's or default's case ID
	 * @action NavigateCaseTriggerAction
	 */
	@Effect()
	selectDefaultCaseUpdateRouter$: Observable<NavigateCaseTriggerAction> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.withLatestFrom(this.store$.select(routerStateSelector), ({ payload }: (SelectCaseAction | SaveCaseAsSuccessAction), router: IRouterState): any[] => {
			return [payload, router.caseId];
		})
		.filter(([selectedCase, routerCaseId]) => selectedCase.id === this.casesService.defaultCase.id)
		.map(([selectedCase, routerCaseId]: [Case, string]) => new NavigateCaseTriggerAction());

	constructor(protected actions$: Actions, protected store$: Store<any>, protected casesService: CasesService) {
	}
}
