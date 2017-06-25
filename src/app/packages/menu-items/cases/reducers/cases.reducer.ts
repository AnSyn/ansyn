import { CasesActionTypes, CasesActions } from '../actions/cases.actions';
import { Case } from '../models/case.model';
import { Context } from '../models/context.model';
import { isNil } from 'lodash';
import { Params } from '@angular/router';

export interface ICasesState {
	cases: Case[];
	unlisted_case: Case;
	default_case: Case;
	default_case_query_params: Params;
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
	default_case_query_params: null,
	active_case_id: "",
	modal: false,
	contexts: [],
	contexts_loaded: false,
	updating_backend: false
};


export function CasesReducer(state: ICasesState = initialCasesState , action: CasesActions ) {

	switch (action.type) {

		case CasesActionTypes.ADD_CASE:
			return Object.assign({}, state);

		case CasesActionTypes.ADD_CASE_SUCCESS:
			const cases_added: Case[] = [
				action.payload,
				...state.cases,
			];
			return Object.assign({}, state, {cases: cases_added });

		case CasesActionTypes.OPEN_MODAL:
			return Object.assign({}, state, {active_case_id: action.payload.case_id , modal: true});

		case CasesActionTypes.CLOSE_MODAL:
			return Object.assign({}, state, {active_case_id: null, modal: false});

		// reference
		case CasesActionTypes.UPDATE_CASE:
			let old_case: Case = state.cases.find((case_value: Case) => case_value.id == action.payload.id);
			if(!old_case){
				if(action.payload.id == state.selected_case.id){
					return {...state, selected_case: action.payload};
				}
			}
			const indexOfUpdated = state.cases.indexOf(old_case);
			const updated_case = action.payload;


			Object.keys(old_case).forEach( (key: string) => {
				old_case[key] = updated_case[key];
			});

			const cases_updated: Case[] = [
				...state.cases.slice(0, indexOfUpdated),
				old_case,
				...state.cases.slice(indexOfUpdated + 1, state.cases.length)
			];
			return Object.assign({}, state, {cases: cases_updated});

		case CasesActionTypes.UPDATE_CASE_BACKEND:
			return Object.assign({}, state, {updating_backend: true});

		case CasesActionTypes.UPDATE_CASE_BACKEND_SUCCESS:
			return Object.assign({}, state, {updating_backend: false});

		case CasesActionTypes.LOAD_CASES:
			return state;

		case CasesActionTypes.LOAD_CASES_SUCCESS:
			let cases_loaded: Case[] = [
				...state.cases,
				...action.payload
			];
			return Object.assign({}, state, {cases: cases_loaded});

		case CasesActionTypes.DELETE_CASE:
			return state;

		case CasesActionTypes.DELETE_CASE_SUCCESS:
			let case_to_remove: Case = state.cases.find((case_value: Case) => case_value.id === state.active_case_id);
			let case_to_remove_index: number = state.cases.indexOf(case_to_remove);
			let cases: Case[] = [
				...state.cases.slice(0, case_to_remove_index),
				...state.cases.slice(case_to_remove_index + 1, state.cases.length),
			];
			return Object.assign({}, state, {cases});

		case CasesActionTypes.SELECT_CASE_BY_ID:
			if(state.selected_case && state.selected_case.id == action.payload) {
				return Object.assign({}, state);
			}
			let s_case = state.cases.find((case_value: Case) => case_value.id == action.payload);
			if(isNil(s_case)){
				if(state.unlisted_case && state.unlisted_case.id == action.payload) {
					s_case = state.unlisted_case;

				} else if(state.default_case.id == action.payload) {
					s_case = state.default_case;
				}
			}
			return Object.assign({}, state, { selected_case: s_case });

		case CasesActionTypes.LOAD_CONTEXTS:
			return Object.assign({}, state);

		case CasesActionTypes.LOAD_CONTEXTS_SUCCESS:
			return Object.assign({}, state, {contexts: action.payload, contexts_loaded: true});

		case CasesActionTypes.LOAD_CASE:
			return Object.assign({}, state);

		case CasesActionTypes.LOAD_CASE_SUCCESS:
			return Object.assign({}, state, {unlisted_case: action.payload});

		case CasesActionTypes.LOAD_DEFAULT_CASE:
			return Object.assign({}, state);

		case CasesActionTypes.LOAD_DEFAULT_CASE_SUCCESS:
			return Object.assign({}, state, {default_case: action.payload});

		case CasesActionTypes.SAVE_DEFAULT_CASE:
			return Object.assign({}, state);

		case CasesActionTypes.COPY_CASE_LINK:
			return Object.assign({}, state);

		case CasesActionTypes.SET_QUERY_PARAMS:
			return Object.assign({}, state, {default_case_query_params: action.payload});

		case CasesActionTypes.REMOVE_QUERY_PARAMS:
			return Object.assign({}, state, {default_case_query_params: null});

		default:
			return Object.assign({}, state);
	}
}
