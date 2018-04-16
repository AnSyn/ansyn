import { CasesActions, CasesActionTypes } from '../actions/cases.actions';
import { Case } from '../models/case.model';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { CasesService } from '../services/cases.service';
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { CasePreview } from "@ansyn/core";

export interface CaseModal {
	show: boolean,
	id?: string
}

export interface ICasesState extends EntityState<Case> {
	selectedCase: Case;
	modal: CaseModal
}

export const casesFeatureKey = 'cases';

export const casesAdapter = createEntityAdapter<CasePreview>({ sortComparer: (ob1: CasePreview, ob2: CasePreview): number => +ob2.creationTime - +ob1.creationTime });

export const initialCasesState: ICasesState = casesAdapter.getInitialState(<ICasesState>{
	selectedCase: null,
	modal: { show: false }
});

export const casesStateSelector: MemoizedSelector<any, ICasesState> = createFeatureSelector<ICasesState>(casesFeatureKey);

export function CasesReducer(state: ICasesState = initialCasesState, action: any | CasesActions) {

	switch (action.type) {
		case CasesActionTypes.SAVE_CASE_AS_SUCCESS: {
			const selectedCase = action.payload;
			return casesAdapter.addOne(selectedCase, { ...state, selectedCase });
		}

		case CasesActionTypes.ADD_CASE:
			return casesAdapter.addOne(action.payload, state);

		case CasesActionTypes.UPDATE_CASE: {
			const caseToUpdate: Case = { ...action.payload, lastModified: new Date() };
			const selectedCase = caseToUpdate.id === state.selectedCase.id ? caseToUpdate : state.selectedCase;
			return casesAdapter.updateOne({ id: caseToUpdate.id, changes: caseToUpdate }, { ...state, selectedCase });
		}

		case CasesActionTypes.DELETE_CASE:
			return casesAdapter.removeOne(action.payload, state);

		case CasesActionTypes.ADD_CASES:
			return casesAdapter.addMany(action.payload, state);

		case CasesActionTypes.OPEN_MODAL:
			return { ...state, modal: { id: action.payload.caseId, show: true } };

		case CasesActionTypes.CLOSE_MODAL:
			return { ...state, modal: { id: null, show: false } };

		case CasesActionTypes.SELECT_CASE:
			const selectedCase: Case = action.payload;
			if (!selectedCase.state.time) {
				selectedCase.state.time = CasesService.defaultTime;
			}
			return { ...state, selectedCase };

		default:
			return state;
	}
}

export const { selectEntities, selectAll, selectTotal, selectIds } = casesAdapter.getSelectors();
export const selectCaseTotal = createSelector(casesStateSelector, selectTotal);
export const selectCaseEntities = createSelector(casesStateSelector, selectEntities);
export const selectCasesIds = createSelector(casesStateSelector, selectIds);

