import { Injectable } from '@angular/core';
import { Actions, Effect, ofType, createEffect } from '@ngrx/effects';
import { Observable } from 'rxjs';
import {
	ISetStatePayload,
	NavigateCaseTriggerAction,
	RouterActionTypes,
	SetStateAction
} from '../actions/router.actions';
import { Router } from '@angular/router';
import {
	CasesActionTypes,
	CasesService,
	casesStateSelector,
	ICasesState,
	LoadCaseAction,
	LoadDefaultCaseAction,
	SaveCaseAsSuccessAction,
	SelectCaseAction,
	SelectCaseSuccessAction,
	ICase
} from '@ansyn/ansyn';
import { IRouterState, routerStateSelector } from '../reducers/router.reducer';
import { Store } from '@ngrx/store';
import { filter, map, tap, withLatestFrom } from 'rxjs/operators';

@Injectable()
export class RouterEffects {

	onNavigateCase$ = createEffect(() => this.actions$.pipe(
		ofType(NavigateCaseTriggerAction),
		tap(payload => {
			if (payload) {
				this.router.navigate(['case', payload]);
			} else {
				this.router.navigate(['']);
			}
		})),
		{ dispatch: false }
	);

	onUpdateLocationDefaultCase$ = createEffect(() => this.actions$.pipe(
		ofType(SetStateAction),
		filter((payload) => !(payload.caseId)),
		withLatestFrom(this.store$.select(casesStateSelector)),
		filter(([, cases]: [any, ICasesState]) => (!cases.selectedCase || cases.selectedCase.id !== this.casesService.defaultCase.id)),
		map(([action, cases]) => LoadDefaultCaseAction(action.payload.queryParams))
	));

	onUpdateLocationCase$ = createEffect(() => this.actions$.pipe(
		ofType(SetStateAction),
		filter(caseId => Boolean(caseId)),
		withLatestFrom(this.store$.select(casesStateSelector)),
		filter(([caseId, cases]) => !cases.selectedCase || caseId.caseId !== cases.selectedCase.id),
		map(([caseId]) => LoadCaseAction({payload: caseId.caseId }))
	));

	selectCaseUpdateRouter$ = createEffect(() => this.actions$.pipe(
		ofType(SelectCaseAction, SelectCaseSuccessAction),
		withLatestFrom(this.store$.select(routerStateSelector)),
		filter(([, router]: [any, IRouterState]) => Boolean(router)),
		filter(([payload, router]: [ICase, IRouterState]) => payload.id !== this.casesService.defaultCase.id && payload.id !== router.caseId),
		map(([payload, router]: [ICase, IRouterState]) => NavigateCaseTriggerAction({payload: payload.id}))
	));

	selectDefaultCaseUpdateRouter$ = createEffect(() => this.actions$.pipe(
		ofType(SelectCaseAction),
		filter((payload) => payload.id === this.casesService.defaultCase.id),
		map(() => NavigateCaseTriggerAction({})))
	);

	constructor(protected actions$: Actions, protected store$: Store<any>, protected router: Router, protected casesService: CasesService) {
	}

}
