import { Action } from '@ngrx/store';
import { Case } from '../models/case.model';
import { Context } from '../models/context.model';
import { Params } from '@angular/router';

export const CasesActionTypes = {
	LOAD_CASES: 'LOAD_CASES',
	LOAD_CASES_SUCCESS: 'LOAD_CASES_SUCCESS',

	ADD_CASE: 'ADD_CASE',
	ADD_CASE_SUCCESS: 'ADD_CASE_SUCCESS',

	DELETE_CASE: 'DELETE_CASE',
	DELETE_CASE_SUCCESS: 'DELETE_CASE_SUCCESS',

	UPDATE_CASE: 'UPDATE_CASE',
	UPDATE_CASE_BACKEND: 'UPDATE_CASE_BACKEND',
	UPDATE_CASE_BACKEND_SUCCESS: 'UPDATE_CASE_BACKEND_SUCCESS',

	OPEN_MODAL: 'OPEN_MODAL',
	CLOSE_MODAL: 'CLOSE_MODAL',

	SELECT_CASE_BY_ID: 'SELECT_CASE_BY_ID',

	LOAD_CONTEXTS: 'LOAD_CONTEXTS',
	LOAD_CONTEXTS_SUCCESS: 'LOAD_CONTEXTS_SUCCESS',

	LOAD_CASE: 'LOAD_CASE',
	LOAD_CASE_SUCCESS: 'LOAD_CASE_SUCCESS',

	LOAD_DEFAULT_CASE: 'LOAD_DEFAULT_CASE',
	LOAD_DEFAULT_CASE_SUCCESS: 'LOAD_DEFAULT_CASE_SUCCESS',

	SAVE_DEFAULT_CASE: 'SAVE_DEFAULT_CASE',
	COPY_CASE_LINK: 'COPY_CASE_LINK'
};

export type CasesActions = any;

export class LoadCasesAction implements Action{
	type = CasesActionTypes.LOAD_CASES;
	constructor(public payload?: Case[]){}
}
export class LoadCasesSuccessAction implements Action{
	type = CasesActionTypes.LOAD_CASES_SUCCESS;
	constructor(public payload: Case[]){}
}

export class AddCaseAction implements Action{
	type = CasesActionTypes.ADD_CASE;
	constructor(public payload: Case){}
}

export class AddCaseSuccessAction implements Action{
	type = CasesActionTypes.ADD_CASE_SUCCESS;
	constructor(public payload: Case){}
}

export class UpdateCaseAction implements Action{
	type = CasesActionTypes.UPDATE_CASE;
	constructor(public payload: Case){}
}
export class UpdateCaseBackendSuccessAction implements Action{
	type = CasesActionTypes.UPDATE_CASE_BACKEND_SUCCESS;
	constructor(public payload: Case){}
}
export class UpdateCaseBackendAction implements Action{
	type = CasesActionTypes.UPDATE_CASE_BACKEND;
	constructor(public payload: Case){}
}

export class DeleteCaseAction implements Action{
	type = CasesActionTypes.DELETE_CASE;
	constructor(public payload?: Case){}
}

export class DeleteCaseSuccessAction implements Action{
	type = CasesActionTypes.DELETE_CASE_SUCCESS;
	constructor(public payload?: any){}
}

export class OpenModalAction implements Action{
	type = CasesActionTypes.OPEN_MODAL;
	constructor(public payload: {component: any, case_id?: string}){}
}
export class CloseModalAction implements Action{
	type = CasesActionTypes.CLOSE_MODAL;
	constructor(public payload?: any){}
}
export class SelectCaseByIdAction implements Action{
	type = CasesActionTypes.SELECT_CASE_BY_ID;
	constructor(public payload: string){
	}
}
export class LoadContextsAction implements Action{
	type = CasesActionTypes.LOAD_CONTEXTS;
	constructor(public payload?: string){}
}
export class LoadContextsSuccessAction implements Action{
	type = CasesActionTypes.LOAD_CONTEXTS_SUCCESS;
	constructor(public payload: Context[]){}
}
export class LoadCaseAction implements Action{
	type = CasesActionTypes.LOAD_CASE;
	constructor(public payload: string){}
}
export class LoadCaseSuccessAction implements Action{
	type = CasesActionTypes.LOAD_CASE_SUCCESS;
	constructor(public payload: Case){}
}
export class LoadDefaultCaseAction implements Action {
	type = CasesActionTypes.LOAD_DEFAULT_CASE;
	constructor(public payload?: Params) {}
}
export class LoadDefaultCaseSuccessAction implements Action {
	type = CasesActionTypes.LOAD_DEFAULT_CASE_SUCCESS;
	constructor(public payload: Case) {}
}
export class SaveDefaultCaseAction implements Action {
	type = CasesActionTypes.SAVE_DEFAULT_CASE;
	constructor(public payload: Case) {}
}
export class CopyCaseLinkAction implements Action {
	type = CasesActionTypes.COPY_CASE_LINK;
	constructor(public payload: string) {}
}
