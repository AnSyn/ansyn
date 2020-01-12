import { createAction, props } from '@ngrx/store';
import { Params } from '@angular/router';
import { IStoredEntity } from '../../../core/services/storage/storage.service';
import { ICase, ICasePreview, IDilutedCase, IDilutedCaseState } from '../models/case.model';

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
	MANUAL_SAVE: 'MANUAL_SAVE',

	SET_AUTO_SAVE: 'SET_AUTO_SAVE',
};

export type CasesActions = any;


export const LoadDefaultCaseIfNoActiveCaseAction = createAction(
													CasesActionTypes.LOAD_DEFAULT_CASE_IF_NO_ACTIVE_CASE
													);

export const LoadCasesAction = createAction(
								CasesActionTypes.LOAD_CASES,
								props<{cases: ICase[]}>()
);

export const AddCasesAction = createAction(
								CasesActionTypes.ADD_CASES,
								props<{cases: ICase[]}>()
);

export const AddCaseAction = createAction(
							CasesActionTypes.ADD_CASE,
							props<ICase>()
							);

export const UpdateCaseAction = createAction(
								CasesActionTypes.UPDATE_CASE,
								props<{ updatedCase: ICase, forceUpdate?: boolean}>()
								);

export const UpdateCaseBackendAction = createAction(
									CasesActionTypes.UPDATE_CASE_BACKEND,
									props<ICase>()
									);

export const UpdateCaseBackendSuccessAction = createAction(
										CasesActionTypes.UPDATE_CASE_BACKEND_SUCCESS,
										props<IStoredEntity<ICasePreview, IDilutedCaseState>>()
										);

export const DeleteCaseAction = createAction(CasesActionTypes.DELETE_CASE,
											props<{payload: string}>()
										);

export const OpenModalAction = createAction(CasesActionTypes.OPEN_MODAL,
											props<{ component: any, caseId?: string }>()
											);

export const CloseModalAction = createAction(
								CasesActionTypes.CLOSE_MODAL,
								props<{payload: any}>()
								);

export const SelectCaseAction = createAction(
								CasesActionTypes.SELECT_CASE,
								props<ICase>()
								);

export const SelectCaseSuccessAction = createAction(
										CasesActionTypes.SELECT_CASE_SUCCESS,
										props<ICase>()
										);

export const SelectDilutedCaseAction = createAction(
										CasesActionTypes.SELECT_DILUTED_CASE,
										props<IDilutedCase>()
										);

export const LoadCaseAction = createAction(
								CasesActionTypes.LOAD_CASE,
								props<{payload: string}>()
								);

export const LoadDefaultCaseAction = createAction(
										CasesActionTypes.LOAD_DEFAULT_CASE,
										props<{payload: Params}>() // payload default = {}
										);

export const SaveCaseAsAction = createAction(
								CasesActionTypes.SAVE_CASE_AS,
								props<ICase>()
								);

export const SaveCaseAsSuccessAction = createAction(
										CasesActionTypes.SAVE_CASE_AS_SUCCESS,
										props<ICase>()
										);

export const CopyCaseLinkAction = createAction(
									CasesActionTypes.COPY_CASE_LINK,
									props<{ caseId: string, shareCaseAsQueryParams?: boolean }>()
								);

export const ManualSaveAction = createAction(
									CasesActionTypes.MANUAL_SAVE,
									props<ICase>()
									);

export const SetAutoSave = createAction(CasesActionTypes.SET_AUTO_SAVE,
										props<{payload: boolean}>()
										);
