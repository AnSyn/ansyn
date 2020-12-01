import { caseModalType, CasesActions, CasesActionTypes, DeleteCaseAction } from '../actions/cases.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
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
export const myCasesAdapter: EntityAdapter<ICasePreview> = createEntityAdapter<ICasePreview>({ sortComparer: casesSortFn });
export const sharedCasesAdapter: EntityAdapter<ICasePreview> = createEntityAdapter<ICasePreview>({ sortComparer: casesSortFn });

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
			return { ...state, showCasesTable: show }
		}

		case CasesActionTypes.UPDATE_CASE: {
			return { ...state, selectedCase: action.payload }
		}

		case CasesActionTypes.DELETE_CASE_SUCCESS: {
			const { id, type } = action.payload;
			if (type === CasesType.MyCases) {
				const myCaseState = myCasesAdapter.removeOne(id, state.myCases);
				return { ...state, myCases: myCaseState };
			}
			const sharedCaseState = sharedCasesAdapter.removeOne(id, state.sharedCases);
			return { ...state, sharedCases: sharedCaseState };
		}

		case CasesActionTypes.ADD_CASES: {
			const { cases, type } = action.payload;
			if (type === CasesType.MySharedCases) {
				const sharedCases = sharedCasesAdapter.addMany(cases, state.sharedCases);
				return { ...state, sharedCases }
			}
			const myCases = myCasesAdapter.addMany(cases, state.myCases);
			return { ...state, myCases };
		}

		case CasesActionTypes.OPEN_MODAL:
			return { ...state, modal: { type: action.payload.type, id: action.payload.caseId, show: true } };

		case CasesActionTypes.CLOSE_MODAL:
			return { ...state, modal: { type: null, id: null, show: false } };

		case CasesActionTypes.SELECT_CASE:
			return { ...state, selectedCase: null };

		case CasesActionTypes.SELECT_CASE_SUCCESS:
			return { ...state, selectedCase: action.payload };

		case CasesActionTypes.SAVE_SHARED_CASE_AS_MY_OWN: {
			const id = action.payload;
			return { ...state, selectedCase: state.sharedCases.entities[id] }
		}

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
export const selectSharedCasesEntities = createSelector(sharedCasesState, sharedCasesEntities);
export const selectSharedCasesIds = createSelector(sharedCasesState, sharedCasesIds);
export const selectSharedCasesData: MemoizedSelector<any, [Array<string | number>, Dictionary<ICasePreview>]> = createSelector(selectSharedCasesIds, selectSharedCasesEntities, (ids, entities) => [ids, entities]);

export const selectCaseById = (id: string) => createSelector(selectMyCasesEntities, selectSharedCasesEntities, (entities, sharedEntities) => {
	if (entities && entities[id]) {
		return entities[id]
	}
	// in case the case not in my cases search in the shared case.
	return sharedEntities && sharedEntities[id]
});
export const selectSelectedCase = createSelector(casesStateSelector, (cases) => cases && cases.selectedCase);
export const selectModalState = createSelector(casesStateSelector, (cases) => cases?.modal);
export const selectShowCasesTable = createSelector(casesStateSelector, (cases) => cases?.showCasesTable);
