import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
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
	casesStateSelector, ICase,
	ICasesState,
	LoadCaseAction,
	LoadDefaultCaseAction,
	SaveCaseAsSuccessAction,
	SelectCaseAction, SelectDilutedCaseAction
} from '@ansyn/ansyn';
import { IRouterState, routerStateSelector } from '../reducers/router.reducer';
import { Store } from '@ngrx/store';
import { filter, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import { MenuActionTypes } from '@ansyn/menu';
import { SetStateActionSuccess } from 'src/app/@ansyn/menu/actions/menu.actions';

@Injectable()
export class RouterEffects {

	@Effect({ dispatch: false })
	onNavigateCase$: Observable<any> = this.actions$.pipe(
		ofType<NavigateCaseTriggerAction>(RouterActionTypes.NAVIGATE_CASE),
		tap(({ payload }) => {
			if (payload) {
				this.router.navigate([payload.schema , payload.id]);
			}
			else {
				this.router.navigate(['']);
			}
		})
	);

	@Effect()
	onUpdateLocationDefaultCase$: Observable<SetStateActionSuccess> = this.actions$.pipe(
		ofType<SetStateAction>(RouterActionTypes.SET_STATE),
		filter((action) => !(action.payload.caseId)),
		withLatestFrom(this.store$.select(casesStateSelector)),
		filter(([action, cases]: [SetStateAction, ICasesState]) => (!cases.selectedCase || cases.selectedCase.id !== this.casesService.defaultCase.id)),
		map(([action, cases]) => new SetStateActionSuccess())
	);

	@Effect()
	onUpdateLocationCase$: Observable<LoadCaseAction> = this.actions$.pipe(
		ofType<SetStateAction>(RouterActionTypes.SET_STATE),
		map(({ payload }): Partial<ISetStatePayload> => payload),
		filter(({ caseId }) => Boolean(caseId)),
		withLatestFrom(this.store$.select(casesStateSelector)),
		filter(([{ caseId }, cases]) => !cases.selectedCase || caseId !== cases.selectedCase.id),
		map(([{ caseId }]) => new LoadCaseAction(caseId))
	);

	@Effect()
	selectCaseUpdateRouter$: Observable<NavigateCaseTriggerAction> = this.actions$.pipe(
		ofType(CasesActionTypes.SELECT_CASE, CasesActionTypes.SAVE_CASE_AS_SUCCESS),
		withLatestFrom(this.store$.select(routerStateSelector)),
		filter(([action, router]: [(SelectCaseAction | SaveCaseAsSuccessAction), IRouterState]) => Boolean(router)),
		filter(([action, router]: [(SelectCaseAction | SaveCaseAsSuccessAction), IRouterState]) => action.payload.id !== this.casesService.defaultCase.id && action.payload.id !== router.caseId),
		map(([action, router]: [SelectCaseAction | SaveCaseAsSuccessAction, IRouterState]) => new NavigateCaseTriggerAction({schema: (action.payload.schema) ? action.payload.schema : 'case', id: action.payload.id})
		));

	@Effect()
	loadDefaultCase$: Observable<any> = this.actions$.pipe(
		ofType(CasesActionTypes.LOAD_DEFAULT_CASE),
		filter( (action) => !(action as LoadDefaultCaseAction).payload.context),
		withLatestFrom(this.store$.select(routerStateSelector)),
		mergeMap(([action, router]: [(SelectDilutedCaseAction), IRouterState]) => {
			if (router.linkId) {
				return this.casesService.getLink(router.linkId);
			}

			const defaultCaseQueryParams: ICase = this.casesService.parseCase(cloneDeep(this.casesService.defaultCase));
			return [new SelectDilutedCaseAction(defaultCaseQueryParams)];
		}));

	@Effect()
	selectDefaultCaseUpdateRouter$: Observable<NavigateCaseTriggerAction> = this.actions$.pipe(
		ofType(CasesActionTypes.SELECT_CASE),
		filter((action: SelectCaseAction) => action.payload.id === this.casesService.defaultCase.id),
		map(() => new NavigateCaseTriggerAction())
	);

	@Effect()
	setStateActionFromOtherLibs$: Observable<SetStateAction> = this.actions$.pipe(
		ofType<SetStateAction>(MenuActionTypes.RESET_APP),
		map(() => new SetStateAction({linkId: undefined, caseId: undefined})),
	);

	constructor(protected actions$: Actions, protected store$: Store<any>, protected router: Router,
		protected casesService: CasesService) {
	}

}
