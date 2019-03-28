import { Action } from '@ngrx/store';
import { IStoredEntity } from '../../../core/public_api';
import { ICase, ICasePreview, IDilutedCase, IDilutedCaseState } from '@ansyn/imagery';
import { Params } from '@angular/router';

export const CasesActionTypes = {
	LOAD_CASES: 'LOAD_CASES',
	LOAD_CASE: 'LOAD_CASE',

	ADD_CASES: 'ADD_CASES',
	ADD_CASE: 'ADD_CASE',

	DELETE_CASE: 'DELETE_CASE',

	UPDATE_CASE: 'UPDATE_CASE',
	UPDATE_CASE_BACKEND: 'UPDATE_CASE_BACKEND',
	UPDATE_CASE_BACKEND_SUCCESS: 'UPDATE_CASE_BACKEND_SUCCESS',

	OPEN_MODAL: 'OPEN_MODAL',
	CLOSE_MODAL: 'CLOSE_MODAL',

	SELECT_CASE: 'SELECT_CASE',
	SELECT_CASE_SUCCESS: 'SELECT_CASE_SUCCESS',

	SELECT_DILUTED_CASE: 'SELECT_DILUTED_CASE',
	SELECT_CASE_BY_ID: 'SELECT_CASE_BY_ID',

	LOAD_DEFAULT_CASE: 'LOAD_DEFAULT_CASE',

	SAVE_CASE_AS: 'SAVE_CASE_AS',
	SAVE_CASE_AS_SUCCESS: 'SAVE_CASE_AS_SUCCESS',

	COPY_CASE_LINK: 'COPY_CASE_LINK',

	SET_DEFAULT_CASE_QUERY_PARAMS: 'SET_DEFAULT_CASE_QUERY_PARAMS',
	REMOVE_DEFAULT_CASE_QUERY_PARAMS: 'REMOVE_DEFAULT_CASE_QUERY_PARAMS',
	TOGGLE_FAVORITE_OVERLAY: 'TOGGLE_FAVORITE_OVERLAY',

	LOAD_DEFAULT_CASE_IF_NO_ACTIVE_CASE: 'LOAD_DEFAULT_CASE_IF_NO_ACTIVE_CASE',
	MANUAL_SAVE: 'MANUAL_SAVE'
};

export type CasesActions = any;

export class LoadDefaultCaseIfNoActiveCaseAction implements Action {
	type = CasesActionTypes.LOAD_DEFAULT_CASE_IF_NO_ACTIVE_CASE;
}

export class LoadCasesAction implements Action {
	type = CasesActionTypes.LOAD_CASES;

	constructor(public payload?: ICase[]) {
	}
}

export class AddCasesAction implements Action {
	type = CasesActionTypes.ADD_CASES;

	constructor(public payload: ICase[]) {
	}
}

export class AddCaseAction implements Action {
	type = CasesActionTypes.ADD_CASE;

	constructor(public payload: ICase) {
	}
}

export class UpdateCaseAction implements Action {
	type = CasesActionTypes.UPDATE_CASE;

	constructor(public payload: { updatedCase: ICase, forceUpdate?: boolean }) {
	}
}

export class UpdateCaseBackendAction implements Action {
	type = CasesActionTypes.UPDATE_CASE_BACKEND;

	constructor(public payload: ICase) {
	}
}

export class UpdateCaseBackendSuccessAction implements Action {
	type = CasesActionTypes.UPDATE_CASE_BACKEND_SUCCESS;

	constructor(public payload: IStoredEntity<ICasePreview, IDilutedCaseState>) {
	}
}

export class DeleteCaseAction implements Action {
	type = CasesActionTypes.DELETE_CASE;

	constructor(public payload: string) {
	}
}

export class OpenModalAction implements Action {
	type = CasesActionTypes.OPEN_MODAL;

	constructor(public payload: { component: any, caseId?: string }) {
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

export class SelectDilutedCaseAction implements Action {
	type = CasesActionTypes.SELECT_DILUTED_CASE;

	constructor(public payload: IDilutedCase) {
	}
}

export class LoadCaseAction implements Action {
	type = CasesActionTypes.LOAD_CASE;

	constructor(public payload: string) {
	}
}

export class LoadDefaultCaseAction implements Action {
	type = CasesActionTypes.LOAD_DEFAULT_CASE;

	constructor(public payload: Params = {}) {
	}
}

export class SaveCaseAsAction implements Action {
	type = CasesActionTypes.SAVE_CASE_AS;

	constructor(public payload: ICase) {
	}
}

export class SaveCaseAsSuccessAction implements Action {
	type = CasesActionTypes.SAVE_CASE_AS_SUCCESS;

	constructor(public payload: ICase) {
	}
}

export class CopyCaseLinkAction implements Action {
	type = CasesActionTypes.COPY_CASE_LINK;

	constructor(public payload: { caseId: string, shareCaseAsQueryParams?: boolean }) {
	}
}

export class ManualSaveAction implements Action {
	readonly type = CasesActionTypes.MANUAL_SAVE;

	constructor(public payload: ICase) {
	}
}
