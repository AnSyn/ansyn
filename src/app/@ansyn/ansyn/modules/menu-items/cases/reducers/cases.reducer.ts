import { caseModalType, CasesActions, CasesActionTypes, DeleteCaseAction } from '../actions/cases.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Dictionary } from '@ngrx/entity/src/models';
import { ICase, ICasePreview } from '../models/case.model';

export interface ICaseModal {
	show: boolean,
	type?: caseModalType,
	id?: string
}

export interface ICasesState extends EntityState<ICasePreview> {
	selectedCase: ICase;
	modal: ICaseModal;
	autoSave: boolean;
}

export const casesFeatureKey = 'cases';

export const casesAdapter: EntityAdapter<ICasePreview> = createEntityAdapter<ICasePreview>({ sortComparer: (ob1: ICasePreview, ob2: ICasePreview): number => +ob2.creationTime - +ob1.creationTime });

export const initialCasesState: ICasesState = casesAdapter.getInitialState(<ICasesState>{
	selectedCase: null,
	modal: { show: false },
	autoSave: false
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
			const caseToUpdate = { ...action.payload.updatedCase };
			const selectedCase = state.selectedCase && caseToUpdate.id === state.selectedCase.id ? caseToUpdate : state.selectedCase;
			return casesAdapter.updateOne({ id: caseToUpdate.id, changes: caseToUpdate }, { ...state, selectedCase });
		}

		case CasesActionTypes.UPDATE_CASE_BACKEND_SUCCESS, CasesActionTypes.UPDATE_CASE_BACKEND_SAVE_AS: {
			const lastModified = new Date();
			const selectedCase = { ...state.selectedCase, lastModified };
			return casesAdapter.updateOne({ id: action.payload.id, changes: { lastModified } }, {
				...state,
				selectedCase
			});
		}

		case CasesActionTypes.DELETE_CASE:
			return casesAdapter.removeOne((action as DeleteCaseAction).payload.id, state);

		case CasesActionTypes.ADD_CASES:
			return casesAdapter.addMany(action.payload, state);

		case CasesActionTypes.OPEN_MODAL:
			return { ...state, modal: { type: action.payload.type, id: action.payload.caseId, show: true } };

		case CasesActionTypes.CLOSE_MODAL:
			return { ...state, modal: { type: null, id: null, show: false } };

		case CasesActionTypes.SELECT_CASE:
			return { ...state, selectedCase: null };

		case CasesActionTypes.SELECT_CASE_SUCCESS:
			return { ...state, selectedCase: action.payload };

		case CasesActionTypes.SET_AUTO_SAVE:
			return { ...state, autoSave: action.payload };

		default:
			return state;
	}
}

export const { selectEntities, selectAll, selectTotal, selectIds } = casesAdapter.getSelectors();
export const selectCaseTotal = createSelector(casesStateSelector, selectTotal);
export const selectCaseEntities = <MemoizedSelector<ICasesState, Dictionary<ICasePreview>>>createSelector(casesStateSelector, selectEntities);
export const selectCasesIds = <MemoizedSelector<any, string[] | number[]>>createSelector(casesStateSelector, selectIds);
export const selectSelectedCase = createSelector(casesStateSelector, (cases) => cases && cases.selectedCase);
export const selectAutoSave: MemoizedSelector<any, boolean> = createSelector(casesStateSelector, (cases) => {
	return cases.autoSave
});
export const selectModalState = createSelector(casesStateSelector, (cases) => cases?.modal);
