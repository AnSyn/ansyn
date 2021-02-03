import { caseModalType, CasesActions, CasesActionTypes } from '../actions/cases.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { createEntityAdapter, Dictionary, EntityAdapter, EntityState } from '@ngrx/entity';
import { ICase, ICasePreview } from '../models/case.model';
import { CasesType } from '../models/cases-config';
import { isEqualWith } from 'lodash';
import { deepDiffMapper } from '../../../core/utils/deep-diff';
import { casesComparator } from './cases.compare';

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
	wasSaved: boolean;
	openCaseId: string;
	loadCase: boolean;
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
	wasSaved: false,
	openCaseId: null,
	loadCase: false
};

export const casesStateSelector: MemoizedSelector<any, ICasesState> = createFeatureSelector<ICasesState>(casesFeatureKey);

export function CasesReducer(state: ICasesState = initialCasesState, action: any | CasesActions) {

	switch (action.type) {
		case CasesActionTypes.SHOW_CASES_TABLE: {
			const show = action.payload;
			return { ...state, showCasesTable: show }
		}

		case CasesActionTypes.LOAD_CASE: {
			return { ...state, loadCase: true }
		}

		case CasesActionTypes.UPDATE_CASE: {
			console.log('UPDATE_CASE called');
			const casesAreEqual = isEqualWith(state.selectedCase, action.payload, casesComparator);
			const openCaseId = state.loadCase || casesAreEqual ? state.openCaseId : null;
			if (!casesAreEqual) {
				console.log(1, deepDiffMapper.map(state.selectedCase, action.payload));
			}
			return { ...state, selectedCase: action.payload, wasSaved: false, openCaseId, loadCase: false }
		}

		case CasesActionTypes.RENAME_CASE: {
			const { case: _case, newName } = action.payload;
			const { id } = _case;
			const myCasesState = myCasesAdapter.updateOne({ id, changes: { name: newName } }, state.myCases);
			return { ...state, myCases: myCasesState }
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
			return { ...state, selectedCase: action.payload, openCaseId: action.payload.id };

		case CasesActionTypes.SAVE_CASE_AS_SUCCESS:
			const myCasesState = myCasesAdapter.addOne(action.payload, state.myCases);
			return { ...state, myCases: myCasesState, wasSaved: true, openCaseId: action.payload.id };

		case CasesActionTypes.SAVE_SHARED_CASE_AS_MY_OWN: {
			if (typeof action.payload === 'string') {
				return state;
			}
			return { ...state, selectedCase: action.payload, openCaseId: action.payload.id }
		}

		default:
			return state;
	}
}

export const myCasesState = createSelector(casesStateSelector, (state) => state?.myCases);
export const sharedCasesState = createSelector(casesStateSelector, (state) => state?.sharedCases);
export const {
	selectEntities: myCasesEntities,
	selectTotal: myCasesTotal,
	selectIds: myCasesIds
} = myCasesAdapter.getSelectors();
export const {
	selectEntities: sharedCasesEntities,
	selectTotal: sharedCasesTotal,
	selectIds: sharedCasesIds
} = sharedCasesAdapter.getSelectors();
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
export const selectOpenCaseId = createSelector(casesStateSelector, (cases) => cases && cases.openCaseId);
export const selectSelectedCase = createSelector(casesStateSelector, (cases) => cases && cases.selectedCase);
export const selectModalState = createSelector(casesStateSelector, (cases) => cases?.modal);
export const selectShowCasesTable = createSelector(casesStateSelector, (cases) => cases?.showCasesTable);
export const selectCaseSaved = createSelector(casesStateSelector, (cases) => cases?.wasSaved);
