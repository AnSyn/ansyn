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
	ICasesState, IDilutedCase,
	LoadCaseAction,
	LoadDefaultCaseAction,
	SaveCaseAsSuccessAction,
	SelectCaseAction,
	SelectDilutedCaseAction, selectSelectedCase
} from '@ansyn/ansyn';
import { IRouterState, routerStateSelector } from '../reducers/router.reducer';
import { Store } from '@ngrx/store';
import { filter, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import { MenuActionTypes, ResetAppAction, ResetAppActionSuccess } from '@ansyn/menu';

@Injectable()
export class RouterEffects {

	@Effect({ dispatch: false })
	onNavigateCase$: Observable<any> = this.actions$.pipe(
		ofType<NavigateCaseTriggerAction>(RouterActionTypes.NAVIGATE_CASE),
		tap(({ payload }) => {
			if (payload) {
				this.router.navigate([payload.schema, payload.id]);
			}
			else {
				this.router.navigate(['']);
			}
		})
	);

	@Effect()
	onLoadAppByCaseId$ = this.actions$.pipe(
		ofType<SetStateAction>(RouterActionTypes.SET_STATE),
		filter( (action: SetStateAction) => Boolean(action.payload.caseId)),
		tap(() => console.log('load case id')),
		map((action) => new LoadCaseAction(action.payload.caseId)),
	);

	@Effect()
	onLoadAppByLinkId$ = this.actions$.pipe(
		ofType<SetStateAction>(RouterActionTypes.SET_STATE),
		filter( (action: SetStateAction) => Boolean(action.payload.linkId)),
		mergeMap( (action) => this.casesService.getLink(action.payload.linkId)),
		tap((_case) => console.log('load link id',  {_case})),
		map( (_case: IDilutedCase) => new SelectDilutedCaseAction(_case))
	);

	@Effect()
	onLoadDefaultCase$ = this.actions$.pipe(
		ofType<SetStateAction>(RouterActionTypes.SET_STATE),
		filter( (action: SetStateAction) => !action.payload.caseId && !action.payload.linkId),
		withLatestFrom(this.store$.select(selectSelectedCase)),
		filter( ([action, selectCase]) => !selectCase || selectCase.id !== this.casesService.defaultCase.id),
		tap(([action, selectCase]) => console.log('load default case')),
		map( ([action, selectCase]) => new LoadDefaultCaseAction(action.payload.queryParams))
	);

	@Effect()
	selectCaseUpdateRouter$: Observable<NavigateCaseTriggerAction> = this.actions$.pipe(
		ofType(CasesActionTypes.SELECT_CASE, CasesActionTypes.SAVE_CASE_AS_SUCCESS),
		withLatestFrom(this.store$.select(routerStateSelector)),
		filter(([action, router]: [(SelectCaseAction | SaveCaseAsSuccessAction), IRouterState]) => Boolean(router)),
		filter(([action, router]: [(SelectCaseAction | SaveCaseAsSuccessAction), IRouterState]) => action.payload.id !== this.casesService.defaultCase.id && action.payload.id !== router.caseId),
		map(([action, router]: [SelectCaseAction | SaveCaseAsSuccessAction, IRouterState]) => new NavigateCaseTriggerAction({ schema: (action.payload.schema) ? action.payload.schema : 'case', id: action.payload.id })
		));

	@Effect()
	loadDefaultCase$: Observable<any> = this.actions$.pipe(
		ofType(CasesActionTypes.LOAD_DEFAULT_CASE),
		filter((action: LoadDefaultCaseAction) => !action.payload.context),
		withLatestFrom(this.store$.select(routerStateSelector)),
		mergeMap(([action, router]: [(SelectDilutedCaseAction), IRouterState]) => {
			const defaultCase = cloneDeep(this.casesService.defaultCase);
			// the default map id is null, so we generate a new id
			// for the initial map
			const defaultMapId = this.casesService.generateUUID();
			defaultCase.state.maps.data[0].id = defaultMapId;
			defaultCase.state.maps.activeMapId = defaultMapId;
			const defaultCaseQueryParams: ICase = this.casesService.parseCase(defaultCase);
			return [new SelectDilutedCaseAction(defaultCaseQueryParams)];
		}));

	@Effect()
	selectDefaultCaseUpdateRouter$: Observable<NavigateCaseTriggerAction> = this.actions$.pipe(
		ofType(CasesActionTypes.SELECT_CASE),
		filter((action: SelectCaseAction) => action.payload.id === this.casesService.defaultCase.id),
		map(() => new NavigateCaseTriggerAction())
	);

	@Effect()
	onResetApp$: Observable<LoadDefaultCaseAction> = this.actions$.pipe(
		ofType<ResetAppAction>(MenuActionTypes.RESET_APP),
		map(() => new LoadDefaultCaseAction())
	);

	constructor(protected actions$: Actions, protected store$: Store<any>, protected router: Router,
		protected casesService: CasesService) {
	}

}
