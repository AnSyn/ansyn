import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { RouterActionTypes, SetStateAction } from '../actions/router.actions';
import { Router } from '@angular/router';
import {
	CasesActionTypes,
	CasesService,
	LoadCaseAction,
	LoadDefaultCaseAction,
	SelectCaseSuccessAction,
	selectSelectedCase
} from '@ansyn/ansyn';
import { Store } from '@ngrx/store';
import { filter, map, tap, withLatestFrom } from 'rxjs/operators';

@Injectable()
export class RouterEffects {

	/*@Effect({ dispatch: false })
	onNavigateCase$: Observable<any> = this.actions$.pipe(
		ofType<NavigateCaseTriggerAction>(RouterActionTypes.NAVIGATE_CASE),
		tap(({ payload }) => {
			if (payload) {
				this.router.navigate([payload.schema, payload.id]);
			} else {
				this.router.navigate(['']);
			}
		})
	);*/

	@Effect({ dispatch: false })
	onLoadCaseChangeUrl$ = this.actions$.pipe(
		ofType(CasesActionTypes.SELECT_CASE_SUCCESS),
		tap(() => this.router.navigate(['']))
	);

	@Effect()
	onLoadAppByCaseId$ = this.actions$.pipe(
		ofType<SetStateAction>(RouterActionTypes.SET_STATE),
		filter((action: SetStateAction) => Boolean(action.payload.caseId)),
		map((action) => new LoadCaseAction(action.payload.caseId)),
	);

	@Effect()
	onLoadDefaultCase$ = this.actions$.pipe(
		ofType<SetStateAction>(RouterActionTypes.SET_STATE),
		filter((action: SetStateAction) => !action.payload.caseId),
		withLatestFrom(this.store$.select(selectSelectedCase)),
		filter(([action, selectCase]) => !selectCase),
		map(([action, selectCase]) => new LoadDefaultCaseAction(action.payload.queryParams))
	);

	/*@Effect()
	selectCaseUpdateRouter$: Observable<NavigateCaseTriggerAction> = this.actions$.pipe(
		ofType(CasesActionTypes.SELECT_CASE, CasesActionTypes.SAVE_CASE_AS_SUCCESS),
		withLatestFrom(this.store$.select(routerStateSelector)),
		filter(([action, router]: [(SelectCaseAction | SaveCaseAsSuccessAction), IRouterState]) => Boolean(router)),
		filter(([action, router]: [(SelectCaseAction | SaveCaseAsSuccessAction), IRouterState]) => action.payload.id !== this.casesService.defaultCase.id && action.payload.id !== router.caseId),
		map(([action, router]: [SelectCaseAction | SaveCaseAsSuccessAction, IRouterState]) => new NavigateCaseTriggerAction({
				schema: (action.payload.schema) ? action.payload.schema : 'case',
				id: action.payload.id
			})
		));*/

	/*@Effect()
	selectDefaultCaseUpdateRouter$: Observable<NavigateCaseTriggerAction> = this.actions$.pipe(
		ofType(CasesActionTypes.SELECT_CASE),
		filter((action: SelectCaseAction) => action.payload.id === this.casesService.defaultCase.id),
		map(() => new NavigateCaseTriggerAction())
	);*/

	constructor(protected actions$: Actions, protected store$: Store<any>, protected router: Router,
				protected casesService: CasesService) {
	}

}
