import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/switchMap';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import {
  AddCaseAction, AddCaseSuccessAction, CasesActionTypes, CloseModalAction, DeleteCaseSuccessAction,
  LoadCasesSuccessAction,
  UpdateCaseSuccessAction
} from '../actions/cases.actions';
import { CasesService } from '../services/cases.service';
import { ICasesState } from '../reducers/cases.reducer';
import { Case } from '../models/case.model';

@Injectable()
export class CasesEffects {

  constructor(private actions$: Actions, private casesService: CasesService, private store: Store<ICasesState>){}

  @Effect()
  loadCases$: Observable<LoadCasesSuccessAction> = this.actions$
    .ofType(CasesActionTypes.LOAD_CASES)
    .withLatestFrom(this.store)
    .switchMap(([action, state]) => {
      let last_id;
      let last_case: Case = state.cases[state.cases.length - 1];
      if(last_case) last_id = last_case.id;

      return this.casesService.loadCases(last_id )
        .map(new_cases => {
          return new LoadCasesSuccessAction(new_cases);
        });
    }).share();


  @Effect()
  onAddCase$: Observable<AddCaseAction> = this.actions$
    .ofType(CasesActionTypes.ADD_CASE)
    .switchMap((action) => {
      return this.casesService.createCase(action.payload)
        .map((response: any) => {
          let payload: Case = response.json();
          return new AddCaseSuccessAction(payload);
        })
    }).share();

  @Effect()
  onDeleteCase$: Observable<any> = this.actions$
    .ofType(CasesActionTypes.DELETE_CASE)
    .withLatestFrom(this.store, (action, state: {cases: ICasesState}) => state.cases.active_case_id)
    .switchMap((active_case_id: string) => {
      return this.casesService.removeCase(active_case_id).map((res) => {
        let deleted_case: Case = res.json();
        return new DeleteCaseSuccessAction(deleted_case)
      });
    }).share();

  @Effect()
  onUpdateCase$: Observable<any> = this.actions$
    .ofType(CasesActionTypes.UPDATE_CASE)
    .switchMap((action: {payload: Case}) => {
      return this.casesService.updateCase(action.payload).map((response: any) => {
        let updated_case: Case = response.json();
        return new UpdateCaseSuccessAction(updated_case)
      });
    }).share();

  @Effect({dispatch: false})
  openModal$: Observable<any> = this.actions$
    .ofType(CasesActionTypes.OPEN_MODAL)
    .map((action) => {
      return action
    }).share();

  @Effect({dispatch: false})
  closeModal$: Observable<any> = this.actions$
    .ofType(CasesActionTypes.CLOSE_MODAL)
    .share();

  @Effect()
  closeModalAction$: Observable<any> = this.actions$
    .ofType(CasesActionTypes.UPDATE_CASE_SUCCESS, CasesActionTypes.DELETE_CASE_SUCCESS, CasesActionTypes.ADD_CASE_SUCEESS)
    .map(() => {
      return new CloseModalAction()
    })
    .share();

  @Effect({dispatch: false})
  addCaseSuccess$: Observable<any> = this.actions$.
  ofType(CasesActionTypes.ADD_CASE_SUCEESS).share();

}
//
