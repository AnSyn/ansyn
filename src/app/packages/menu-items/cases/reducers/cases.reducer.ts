import { CasesActions, CasesActionTypes } from '../actions/cases.actions';
import { Case } from '../models/case.model';
import { Context } from '../models/context.model';
import { get as _get } from 'lodash';

export interface ICasesState {
	cases: Case[];
	selected_case: Case;
	modalCaseId: string;
	modal: boolean;
	contexts: Context[];
	contexts_loaded: boolean;
	updating_backend: boolean;
}

export const initialCasesState: ICasesState = {
	cases: [],
	selected_case: null,
	modalCaseId: null,
	modal: false,
	contexts: [],
	contexts_loaded: false,
	updating_backend: false
};


export function CasesReducer(state: ICasesState = initialCasesState, action: CasesActions) {

	switch (action.type) {

		case CasesActionTypes.ADD_CASE:
			return Object.assign({}, state);

		case CasesActionTypes.ADD_CASE_SUCCESS:
			const cases_added: Case[] = [
				action.payload,
				...state.cases,
			];
			return Object.assign({}, state, { cases: cases_added });

		case CasesActionTypes.OPEN_MODAL:
			return { ...state, modalCaseId: action.payload.case_id, modal: true };

		case CasesActionTypes.CLOSE_MODAL:
			return { ...state, modalCaseId: null, modal: false };

		case CasesActionTypes.UPDATE_CASE: {
			const active_case: Case = { ...action.payload, last_modified: new Date() };
			const isSelectedCase = active_case.id === _get(state.selected_case, 'id');
			const caseIndex: number = state.cases.findIndex(({ id }) => id === active_case.id);
			if (caseIndex > -1) {
				const before = state.cases.slice(0, caseIndex);
				const after = state.cases.slice(caseIndex + 1, state.cases.length);
				const cases: Case[] = [...before, active_case, ...after];
				return isSelectedCase ? { ...state, cases, selected_case: active_case } : { ...state, cases };
			}
			if (isSelectedCase) {
				return { ...state, selected_case: active_case };
			}
			/* No Case to update */
			return { ...state };
		}


		case CasesActionTypes.UPDATE_CASE_BACKEND:
			return Object.assign({}, state, { updating_backend: true });

		case CasesActionTypes.UPDATE_CASE_BACKEND_SUCCESS:
			return Object.assign({}, state, { updating_backend: false });

		case CasesActionTypes.LOAD_CASES_SUCCESS:
			let cases_loaded: Case[] = [
				...state.cases,
				...action.payload
			];
			return { ...state, cases: cases_loaded };

		case CasesActionTypes.DELETE_CASE:
			const case_to_remove_index: number = state.cases.findIndex((case_value: Case) => case_value.id === state.modalCaseId);
			if (case_to_remove_index === -1) {
				return state;
			}
			const cases: Case[] = [
				...state.cases.slice(0, case_to_remove_index),
				...state.cases.slice(case_to_remove_index + 1, state.cases.length),
			];
			return Object.assign({}, state, { cases });

		case CasesActionTypes.DELETE_CASE_BACKEND:
			return Object.assign({}, state, { updating_backend: true });

		case CasesActionTypes.DELETE_CASE_BACKEND_SUCCESS:
			return Object.assign({}, state, { updating_backend: false });

		case CasesActionTypes.SELECT_CASE:
			return { ...state, selected_case: action.payload };

		case CasesActionTypes.LOAD_CONTEXTS_SUCCESS:
			return Object.assign({}, state, { contexts: action.payload, contexts_loaded: true });

		default:
			return state;
	}
}
