import { Action } from '@ngrx/store';
import { Params } from '@angular/router';
import { ICase, IDilutedCase } from '../models/case.model';
import { ILogMessage } from '../../../core/models/logger.model';
import { CasesType } from '../models/cases-config';

export type caseModalType = 'save' | 'delete';

export const CasesActionTypes = {
	SHOW_CASES_TABLE: 'SHOW_CASES_TABLE',
	LOAD_CASES: 'LOAD_CASES',
	LOAD_CASE: 'LOAD_CASE',

	ADD_CASES: 'ADD_CASES',

	DELETE_CASE: 'DELETE_CASE',
	DELETE_CASE_SUCCESS: 'DELETE_CASE_SUCCESS',

	UPDATE_CASE: 'UPDATE_CASE',

	OPEN_MODAL: 'OPEN_MODAL',
	CLOSE_MODAL: 'CLOSE_MODAL',

	SELECT_CASE: 'SELECT_CASE',
	SELECT_CASE_SUCCESS: 'SELECT_CASE_SUCCESS',

	SELECT_DILUTED_CASE: 'SELECT_DILUTED_CASE',
	SELECT_CASE_BY_ID: 'SELECT_CASE_BY_ID',

	LOAD_DEFAULT_CASE: 'LOAD_DEFAULT_CASE',

	SAVE_CASE_AS: 'SAVE_CASE_AS',
	SAVE_CASE_AS_SUCCESS: 'SAVE_CASE_AS_SUCCESS',
	SAVE_SHARED_CASE_AS_MY_OWN: 'SAVE_SHARED_CASE_AS_MY_OWN',

	COPY_CASE_LINK: 'COPY_CASE_LINK',

	LOAD_DEFAULT_CASE_IF_NO_ACTIVE_CASE: 'LOAD_DEFAULT_CASE_IF_NO_ACTIVE_CASE',

	RENAME_CASE: 'RENAME_CASE'
};

export type CasesActions = any;

export class ShowCasesTableAction implements Action {
	readonly type = CasesActionTypes.SHOW_CASES_TABLE;
	constructor(public payload: boolean = false) {
	}
}

export class LoadDefaultCaseIfNoActiveCaseAction implements Action {
	type = CasesActionTypes.LOAD_DEFAULT_CASE_IF_NO_ACTIVE_CASE;
}

export class LoadCasesAction implements Action, ILogMessage {
	type = CasesActionTypes.LOAD_CASES;

	constructor(public payload: CasesType = CasesType.MyCases, public fromBegin = false) {
	}

	logMessage() {
		return `Loading cases from backend`
	}
}

export class AddCasesAction implements Action {
	type = CasesActionTypes.ADD_CASES;

	constructor(public payload: {cases: ICase[], type?: CasesType}) {
	}
}
export class UpdateCaseAction implements Action {
	type = CasesActionTypes.UPDATE_CASE;

	constructor(public payload: ICase) {
	}
}

export class DeleteCaseAction implements Action  {
	type = CasesActionTypes.DELETE_CASE;

	constructor(public payload: { id: string, name: string, type: CasesType }) {
	}

}

export class DeleteCaseSuccessAction extends DeleteCaseAction implements ILogMessage {
	type = CasesActionTypes.DELETE_CASE_SUCCESS;

	logMessage() {
		return `Deleting case ${this.payload.name} id: ${this.payload.id}`
	}

}

export class OpenModalAction implements Action {
	type = CasesActionTypes.OPEN_MODAL;

	constructor(public payload: { type: caseModalType, caseId?: string }) {
	}
}

export class CloseModalAction implements Action {
	type = CasesActionTypes.CLOSE_MODAL;

	constructor(public payload?: any) {
	}
}

export class SelectCaseAction implements Action {
	type = CasesActionTypes.SELECT_CASE;

	constructor(public payload: ICase) {
	}
}

export class SelectCaseSuccessAction implements Action {
	type = CasesActionTypes.SELECT_CASE_SUCCESS;

	constructor(public payload: ICase) {
	}
}

export class SelectDilutedCaseAction implements Action, ILogMessage {
	type = CasesActionTypes.SELECT_DILUTED_CASE;

	constructor(public payload: IDilutedCase) {
	}

	logMessage() {
		return `Selecting case ${this.payload.name} id: ${this.payload.id}`
	}
}

export class LoadCaseAction implements Action {
	type = CasesActionTypes.LOAD_CASE;

	constructor(public payload: string) {
	}
}

export class LoadDefaultCaseAction implements Action, ILogMessage {
	type = CasesActionTypes.LOAD_DEFAULT_CASE;

	constructor(public payload: Params = {}) {
	}

	logMessage() {
		return `App will load default case`;
	}
}

export class SaveCaseAsAction implements Action {
	readonly type = CasesActionTypes.SAVE_CASE_AS;

	constructor(public payload: ICase) {
	}


}

export class SaveCaseAsSuccessAction extends SaveCaseAsAction implements ILogMessage {
	readonly type = CasesActionTypes.SAVE_CASE_AS_SUCCESS;

	logMessage() {
		return `Saving case as ${this.payload.name} id: ${this.payload.id}`
	}
}

export class SaveSharedCaseAsMyOwn implements Action {
	readonly type = CasesActionTypes.SAVE_SHARED_CASE_AS_MY_OWN;
	constructor(public payload: string | ICase) {
	}
}

export class CopyCaseLinkAction implements Action, ILogMessage {
	type = CasesActionTypes.COPY_CASE_LINK;

	constructor(public payload: { caseId: string, shareCaseAsQueryParams?: boolean, caseName?: string }) {
	}

	logMessage() {
		return `Copying case${this.payload.caseName ? ' ' + this.payload.caseName : ''} id: ${this.payload.caseId} link to clipboard`;
	}
}

export class RenameCaseAction implements Action, ILogMessage {
	readonly type = CasesActionTypes.RENAME_CASE;

	constructor(public payload: { case: ICase, oldName: string, newName: string }) {
	}

	logMessage() {
		return `Renaming case ${this.payload.oldName} id:${this.payload.case.id} to ${this.payload.newName}`
	}
}
