import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/share';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { NavigateCaseTriggerAction, RouterActionTypes } from '../actions/router.actions';
import { Router } from '@angular/router';
import { ISetStatePayload, SetStateAction } from 'src/app/app/router/actions/router.actions';
import { casesStateSelector, ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { IRouterState, routerStateSelector } from 'src/app/app/router/reducers/router.reducer';
import {
	CasesActionTypes, LoadCaseAction, LoadDefaultCaseAction,
	SaveCaseAsSuccessAction, SelectCaseAction
} from '@ansyn/menu-items/cases/actions/cases.actions';
import { Store } from '@ngrx/store';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';

@Injectable()
export class RouterEffects {

	@Effect({ dispatch: false })
	onNavigateCase$: Observable<any> = this.actions$
		.ofType<NavigateCaseTriggerAction>(RouterActionTypes.NAVIGATE_CASE)
		.do(({ payload }) => {
			if (payload) {
				this.router.navigate(['case', payload]);
			} else {
				this.router.navigate(['']);
			}
		});

	@Effect()
	onUpdateLocationDefaultCase$: Observable<LoadDefaultCaseAction> = this.actions$
		.ofType<SetStateAction>(RouterActionTypes.SET_STATE)
		.filter((action) => !(action.payload.caseId))
		.withLatestFrom(this.store$.select(casesStateSelector))
		.filter(([action, cases]: [SetStateAction, ICasesState]) => (!cases.selectedCase || cases.selectedCase.id !== this.casesService.defaultCase.id))
		.map(([action, cases]) => new LoadDefaultCaseAction(action.payload.queryParams));

	@Effect()
	onUpdateLocationCase$: Observable<LoadCaseAction> = this.actions$
		.ofType<SetStateAction>(RouterActionTypes.SET_STATE)
		.map(({ payload }): ISetStatePayload => payload)
		.filter(({ caseId }) => Boolean(caseId))
		.withLatestFrom(this.store$.select(casesStateSelector))
		.filter(([{ caseId }, cases]) => !cases.selectedCase || caseId !== cases.selectedCase.id)
		.map(([{ caseId }]) => new LoadCaseAction(caseId));

	@Effect()
	selectCaseUpdateRouter$: Observable<NavigateCaseTriggerAction> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE, CasesActionTypes.SAVE_CASE_AS_SUCCESS)
		.withLatestFrom(this.store$.select(routerStateSelector))
		.filter(([action, router]: [(SelectCaseAction | SaveCaseAsSuccessAction), IRouterState]) => Boolean(router))
		.filter(([action, router]: [(SelectCaseAction | SaveCaseAsSuccessAction), IRouterState]) => action.payload.id !== this.casesService.defaultCase.id && action.payload.id !== router.caseId)
		.map(([action, router]: [SelectCaseAction | SaveCaseAsSuccessAction, IRouterState]) => new NavigateCaseTriggerAction(action.payload.id));

	@Effect()
	selectDefaultCaseUpdateRouter$: Observable<NavigateCaseTriggerAction> = this.actions$
		.ofType(CasesActionTypes.SELECT_CASE)
		.filter((action: SelectCaseAction) => action.payload.id === this.casesService.defaultCase.id)
		.map(() => new NavigateCaseTriggerAction());

	constructor(protected actions$: Actions, protected store$: Store<any>, protected router: Router, protected casesService: CasesService) {
	}

}
