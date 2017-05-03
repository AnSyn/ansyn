import { CasesActionTypes, CasesActions } from '../actions/cases.actions';
import { Case } from '../models/case.model';

export interface ICasesState {
	cases: Case[];
	selected_case_id: string,
	active_case_id: string,
	modal: boolean
}

export const initialCasesState: ICasesState = {
	cases: [],
	selected_case_id: "",
	active_case_id: "",
	modal: false
};


export function CasesReducer(state: ICasesState = initialCasesState , action: CasesActions ) {

	switch (action.type) {

		case CasesActionTypes.ADD_CASE:
			return state;

		case CasesActionTypes.ADD_CASE_SUCEESS:
			let cases_added: Case[] = [
				action.payload,
				...state.cases,
			];
			return Object.assign({}, state, {cases: cases_added});

		case CasesActionTypes.OPEN_MODAL:
			return Object.assign({}, state, {active_case_id: action.payload.case_id , modal: true});

		case CasesActionTypes.CLOSE_MODAL:
			return Object.assign({}, state, {active_case_id: null, modal: false});

		case CasesActionTypes.UPDATE_CASE:
			return state;

		case CasesActionTypes.UPDATE_CASE_SUCCESS:
			let old_case: Case = state.cases.find((case_value: Case) => case_value.id == state.active_case_id);
			let updated_case = action.payload;
			Object.keys(old_case).forEach( (key: string) => {
				old_case[key] = updated_case[key]
			});
			return state;

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
			let case_to_remove: Case = state.cases.find((case_value: Case) => case_value.id == state.active_case_id);
			let case_to_remove_index: number = state.cases.indexOf(case_to_remove);
			let cases: Case[] = [
				...state.cases.slice(0, case_to_remove_index),
				...state.cases.slice(case_to_remove_index + 1, state.cases.length),
			];
			return Object.assign({}, state, {cases});

		case CasesActionTypes.SELECT_CASE:
			return Object.assign({}, state, {selected_case_id: action.payload});

		default:
			return state;
	}
}
