import { CasesActions, CasesActionTypes } from '../actions/cases.actions';
import { Case } from '../models/case.model';
import { Context } from '../models/context.model';
import { get as _get } from 'lodash';
import { createFeatureSelector, MemoizedSelector } from '@ngrx/store';
import { CasesService } from '../services/cases.service';
import { deepMerge } from '@ansyn/core/utils';

export interface ICasesState {
	cases: Case[];
	selectedCase: Case;
	modalCaseId: string;
	modal: boolean;
	contexts: Context[];
	contextsLoaded: boolean;
	updatingBackend: boolean;
}

export const initialCasesState: ICasesState = {
	cases: [],
	selectedCase: null,
	modalCaseId: null,
	modal: false,
	contexts: [],
	contextsLoaded: false,
	updatingBackend: false
};

export const casesFeatureKey = 'cases';

export const casesStateSelector: MemoizedSelector<any, ICasesState> = createFeatureSelector<ICasesState>(casesFeatureKey);

export function CasesReducer(state: ICasesState = initialCasesState, action: CasesActions) {

	switch (action.type) {

		case CasesActionTypes.ADD_CASE:
			return Object.assign({}, state);

		case CasesActionTypes.ADD_CASE_SUCCESS:
			const casesAdded: Case[] = [
				action.payload,
				...state.cases
			];
			return Object.assign({}, state, { cases: casesAdded });

		case CasesActionTypes.OPEN_MODAL:
			return { ...state, modalCaseId: action.payload.caseId, modal: true };

		case CasesActionTypes.CLOSE_MODAL:
			return { ...state, modalCaseId: null, modal: false };

		case CasesActionTypes.UPDATE_CASE: {
			const activeCase: Case = { ...action.payload, lastModified: new Date() };
			const isSelectedCase = activeCase.id === _get(state.selectedCase, 'id');
			const caseIndex: number = state.cases.findIndex(({ id }) => id === activeCase.id);
			if (caseIndex > -1) {
				const before = state.cases.slice(0, caseIndex);
				const after = state.cases.slice(caseIndex + 1, state.cases.length);
				const cases: Case[] = [...before, activeCase, ...after];
				return isSelectedCase ? { ...state, cases, selectedCase: activeCase } : { ...state, cases };
			}
			if (isSelectedCase) {
				return { ...state, selectedCase: activeCase };
			}
			/* No Case to update */
			return { ...state };
		}


		case CasesActionTypes.UPDATE_CASE_BACKEND:
			return Object.assign({}, state, { updatingBackend: true });

		case CasesActionTypes.UPDATE_CASE_BACKEND_SUCCESS:
			return Object.assign({}, state, { updatingBackend: false });

		case CasesActionTypes.LOAD_CASES_SUCCESS:
			let casesLoaded: Case[] = [
				...state.cases,
				...action.payload
			];
			return { ...state, cases: casesLoaded };

		case CasesActionTypes.DELETE_CASE:
			const caseToRemoveIndex: number = state.cases.findIndex((caseValue: Case) => caseValue.id === state.modalCaseId);
			if (caseToRemoveIndex === -1) {
				return state;
			}
			const cases: Case[] = [
				...state.cases.slice(0, caseToRemoveIndex),
				...state.cases.slice(caseToRemoveIndex + 1, state.cases.length)
			];
			return Object.assign({}, state, { cases });

		case CasesActionTypes.DELETE_CASE_BACKEND:
			return Object.assign({}, state, { updatingBackend: true });

		case CasesActionTypes.DELETE_CASE_BACKEND_SUCCESS:
			return Object.assign({}, state, { updatingBackend: false });

		case CasesActionTypes.SELECT_CASE:
			const selectedCase = deepMerge(CasesService.defaultCase, action.payload);
			return { ...state, selectedCase };

		case CasesActionTypes.LOAD_CONTEXTS_SUCCESS:
			return Object.assign({}, state, { contexts: action.payload, contextsLoaded: true });

		default:
			return state;
	}
}
