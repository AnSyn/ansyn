import { CasesActionTypes, CasesActions } from '../actions/cases.actions';
import { Case } from '../models/case.model';
import { Context } from '../models/context.model';
import { isNil, isEmpty, cloneDeep, pull, get as _get } from 'lodash';

export interface ICasesState {
	cases: Case[];
	unlisted_case: Case;
	default_case: Case;
	default_case_query_params: Case;
	selected_case: Case;
	active_case_id: string;
	modal: boolean;
	contexts: Context[];
	contexts_loaded: boolean;
	updating_backend: boolean;
}

export const initialCasesState: ICasesState = {
	cases: [],
	unlisted_case: null,
	selected_case: null,
	default_case: {},
	default_case_query_params: {},
	active_case_id: '',
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
			return Object.assign({}, state, { active_case_id: action.payload.case_id, modal: true });

		case CasesActionTypes.CLOSE_MODAL:
			return Object.assign({}, state, { active_case_id: null, modal: false });

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
			const case_to_remove_index: number = state.cases.findIndex((case_value: Case) => case_value.id === state.active_case_id);
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

		case CasesActionTypes.SELECT_CASE_BY_ID:
			if (state.selected_case && state.selected_case.id === action.payload) {
				return Object.assign({}, state);
			}
			let s_case = state.cases.find(({ id }) => id === action.payload);
			if (isNil(s_case)) {
				if (state.unlisted_case && state.unlisted_case.id === action.payload) {
					s_case = state.unlisted_case;

				} else if (state.default_case.id === action.payload) {
					s_case = isEmpty(state.default_case_query_params) ? state.default_case : state.default_case_query_params;
				}
			}
			return Object.assign({}, state, { selected_case: s_case });

		case CasesActionTypes.LOAD_CONTEXTS_SUCCESS:
			return Object.assign({}, state, { contexts: action.payload, contexts_loaded: true });

		case CasesActionTypes.LOAD_CASE_SUCCESS:
			return Object.assign({}, state, { unlisted_case: action.payload });

		case CasesActionTypes.LOAD_DEFAULT_CASE_SUCCESS:
			return Object.assign({}, state, { default_case: action.payload });

		case CasesActionTypes.SET_DEFAULT_CASE_QUERY_PARAMS:
			return Object.assign({}, state, { default_case_query_params: action.payload });

		case CasesActionTypes.REMOVE_DEFAULT_CASE_QUERY_PARAMS:
			return Object.assign({}, state, { default_case_query_params: null });

		default:
			return state;
	}
}
