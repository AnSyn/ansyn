import { caseModalType, CasesActions, CasesActionTypes, DeleteCaseAction } from '../actions/cases.actions';
import { createFeatureSelector, createSelector, MemoizedSelector, createSelectorFactory } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Dictionary } from '@ngrx/entity/src/models';
import { ICase, ICasePreview } from '../models/case.model';
import { CasesType } from '../models/cases-config';

export interface ICaseModal {
	show: boolean,
	type?: caseModalType,
	id?: string
}

export interface ICasesState {
	myCases: EntityState<ICasePreview>
	sharedCases: EntityState<ICasePreview>
	showCasesTable: boolean;
	selectedCase: ICase;
	modal: ICaseModal;
	autoSave: boolean;
}

export const casesFeatureKey = 'cases';
const casesSortFn = (ob1: ICasePreview, ob2: ICasePreview): number => +ob2.creationTime - +ob1.creationTime;
export const myCasesAdapter: EntityAdapter<ICasePreview> = createEntityAdapter<ICasePreview>({ sortComparer: casesSortFn});
export const sharedCasesAdapter: EntityAdapter<ICasePreview> = createEntityAdapter<ICasePreview>({sortComparer: casesSortFn});

const myCasesInitialState = myCasesAdapter.getInitialState();
const sharedCasesInitialState = sharedCasesAdapter.getInitialState();

export const initialCasesState: ICasesState = {
	myCases: myCasesInitialState,
	sharedCases: sharedCasesInitialState,
	showCasesTable: false,
	selectedCase: null,
	modal: { show: false },
	autoSave: false
};

export const casesStateSelector: MemoizedSelector<any, ICasesState> = createFeatureSelector<ICasesState>(casesFeatureKey);

export function CasesReducer(state: ICasesState = initialCasesState, action: any | CasesActions) {

	switch (action.type) {
		case CasesActionTypes.SHOW_CASES_TABLE: {
			const show = action.payload;
			return {...state, showCasesTable: show}
		}

		/*case CasesActionTypes.SAVE_CASE_AS_SUCCESS: {
			const selectedCase = action.payload;
			return myCasesAdapter.addOne(selectedCase, { ...state, selectedCase });
		}*/

		case CasesActionTypes.UPDATE_CASE: {
			const caseToUpdate = { ...action.payload.updatedCase };
			return {...state, selectedCase: caseToUpdate}
		}

		/*case CasesActionTypes.UPDATE_CASE_BACKEND_SUCCESS || CasesActionTypes.UPDATE_CASE_BACKEND_SAVE_AS: {
			const lastModified = new Date();
			const selectedCase = { ...state.selectedCase, lastModified };
			return casesAdapter.updateOne({ id: action.payload.id, changes: { lastModified } }, {
				...state,
				selectedCase
			});
		}*/

		case CasesActionTypes.DELETE_CASE:
			const myCaseState = myCasesAdapter.removeOne((action as DeleteCaseAction).payload.id, state.myCases);
			return {...state, myCases: myCaseState};

		case CasesActionTypes.ADD_CASES:
			const { cases, type } = action.payload;
			if (type === CasesType.MySharedCases) {
				const sharedCases = sharedCasesAdapter.addMany(cases, state.sharedCases);
				return { ...state, sharedCases }
			}
			const myCases = myCasesAdapter.addMany(cases, state.myCases);
			return {...state, myCases };

		case CasesActionTypes.OPEN_MODAL:
			return { ...state, modal: { type: action.payload.type, id: action.payload.caseId, show: true } };

		case CasesActionTypes.CLOSE_MODAL:
			return { ...state, modal: { type: null, id: null, show: false } };

		case CasesActionTypes.SELECT_CASE:
			return { ...state, selectedCase: null };

		case CasesActionTypes.SELECT_CASE_SUCCESS:
			return { ...state, selectedCase: action.payload };

		/*case CasesActionTypes.SET_AUTO_SAVE:
			return { ...state, autoSave: action.payload };*/

		default:
			return state;
	}
}

export const myCasesState = createSelector(casesStateSelector, (state) => state?.myCases);
export const sharedCasesState = createSelector(casesStateSelector, (state) => state?.sharedCases);
export const { selectEntities: myCasesEntities, selectTotal: myCasesTotal, selectIds: myCasesIds } = myCasesAdapter.getSelectors();
export const { selectEntities: sharedCasesEntities, selectTotal: sharedCasesTotal, selectIds: sharedCasesIds } = sharedCasesAdapter.getSelectors();
export const selectMyCasesTotal = createSelector(myCasesState, myCasesTotal);
export const selectMyCasesEntities = createSelector(myCasesState, myCasesEntities);
export const selectMyCasesIds = createSelector(myCasesState, (state) => myCasesIds(state));
export const selectMyCasesData: MemoizedSelector<any, [Array<string | number>, Dictionary<ICasePreview>]> = createSelector(selectMyCasesIds, selectMyCasesEntities, (ids, entities) => [ids, entities]);

export const selectSharedCaseTotal = createSelector(sharedCasesState, sharedCasesTotal);
export const selectMySharedCasesEntities = createSelector(sharedCasesState, myCasesEntities);
export const selectSharedCasesIds = createSelector(sharedCasesState, (state) => myCasesIds(state));
export const selectSharedCasesData: MemoizedSelector<any, [Array<string | number>, Dictionary<ICasePreview>]> = createSelector(selectSharedCasesIds, selectMySharedCasesEntities, (ids, entities) => [ids, entities]);

export const selectCaseById = (id: string) => createSelector(selectMyCasesEntities, (entities) => entities && entities[id]);
export const selectSelectedCase = createSelector(casesStateSelector, (cases) => cases && cases.selectedCase);
/*export const selectAutoSave: MemoizedSelector<any, boolean> = createSelector(casesStateSelector, (cases) => {
	return cases.autoSave
});*/
export const selectModalState = createSelector(casesStateSelector, (cases) => cases?.modal);
export const selectShowCasesTable = createSelector(casesStateSelector, (cases) => cases?.showCasesTable);
