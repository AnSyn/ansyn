import { CasesActions, CasesActionTypes, SaveCaseAsAction, AddCasesAction, UpdateCaseAction, UpdateCaseBackendSuccessAction, DeleteCaseAction, OpenModalAction } from '../actions/cases.actions';
import { createFeatureSelector, createSelector, MemoizedSelector, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Dictionary } from '@ngrx/entity/src/models';
import { ICase, ICasePreview } from '../models/case.model';

export interface ICaseModal {
	show: boolean,
	id?: string,
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

const reducerFunction = createReducer(initialCasesState,
	on(SaveCaseAsAction, (state, selectedCase) => casesAdapter.addOne(selectedCase, state)),
	on(AddCasesAction, (state, selectedCase) => casesAdapter.addOne(selectedCase, state)),
	on(UpdateCaseAction, (state, payload) => {
		const caseToUpdate = payload.updatedCase;
		const selectedCase = caseToUpdate.id === state.selectedCase.id ? caseToUpdate : state.selectedCase;
		return casesAdapter.updateOne({ id: caseToUpdate.id, changes: caseToUpdate }, { ...state, selectedCase });
	}),
	on(UpdateCaseBackendSuccessAction, (state, payload) => {
		const lastModified = new Date();
		const selectedCase = { ...state.selectedCase, lastModified };
		return casesAdapter.updateOne({ id: payload._id, changes: { lastModified } }, {
			...state,
			selectedCase
		});	}
	),
	 on(DeleteCaseAction, (state, selectedCase) => casesAdapter.removeOne(selectedCase, state)),
	 on(AddCasesAction, (state, payload) => casesAdapter.addOne(payload.cases, state) ),
	//  on(OpenModalAction,)
);



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
			const selectedCase = caseToUpdate.id === state.selectedCase.id ? caseToUpdate : state.selectedCase;
			return casesAdapter.updateOne({ id: caseToUpdate.id, changes: caseToUpdate }, { ...state, selectedCase });
		}

		case CasesActionTypes.UPDATE_CASE_BACKEND_SUCCESS: {
			const lastModified = new Date();
			const selectedCase = { ...state.selectedCase, lastModified };
			return casesAdapter.updateOne({ id: action.payload._id, changes: { lastModified } }, {
				...state,
				selectedCase
			});
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
