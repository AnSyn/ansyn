import { caseModalType, CasesActions, CasesActionTypes } from '../actions/cases.actions';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { createEntityAdapter, Dictionary, EntityAdapter, EntityState } from '@ngrx/entity';
import { ICase, ICasePreview } from '../models/case.model';
import { CasesType } from '../models/cases-config';
import { isEqual, isEqualWith } from 'lodash';

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
			const openCaseId = state.loadCase || isEqual(state.selectedCase, action.payload) ? state.openCaseId : null;
			if (!isEqual(state.selectedCase, action.payload)) {
				console.log(1, deepDiffMapper.map(state.selectedCase, action.payload));
				const comparator = (val1, val2, key) => {
					if (key === 'extentPolygon') {
						return true;
					}
				};
				console.log(2, isEqualWith(state.selectedCase, action.payload, comparator));
				// const cloned1 = cloneDeep<ICase>(state.selectedCase);
				// const cloned2 = cloneDeep<ICase>(action.payload);
				// cloned1.state.maps.data.forEach((mapData) => {
				// 	mapData.data.position.extentPolygon = null;
				// });
				// cloned2.state.maps.data.forEach((mapData) => {
				// 	mapData.data.position.extentPolygon = null;
				// });
				// console.log(2, deepDiffMapper.map(cloned1, cloned2));
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

// Based on https://stackoverflow.com/a/8596559/4402222
const deepDiffMapper = function () {
	return {
		VALUE_CREATED: 'created',
		VALUE_UPDATED: 'updated',
		VALUE_DELETED: 'deleted',
		VALUE_UNCHANGED: 'unchanged',
		map: function (obj1, obj2) {
			if (this.isFunction(obj1) || this.isFunction(obj2)) {
				throw Error('Invalid argument. Function given, object expected.');
			}
			if (this.isValue(obj1) || this.isValue(obj2)) {
				const fromResult = this.compareValues(obj1, obj2);
				let toResult;
				switch (fromResult) {
					case this.VALUE_UNCHANGED:
						toResult = undefined;
						break;
					case this.VALUE_CREATED:
						toResult = {
							type: fromResult,
							data: obj2
						};
						break;
					case this.VALUE_DELETED:
						toResult = {
							type: fromResult,
							data: obj1
						};
						break;
					default:
						toResult = {
							type: fromResult,
							from: obj1,
							to: obj2
						}
				}
				return toResult;
			}

			const diff = {};
			const unchanged = new Set();
			for (let key in obj1) {
				if (this.isFunction(obj1[key])) {
					continue;
				}

				if (!obj2.hasOwnProperty(key)) {
					diff[key] = {
						type: this.VALUE_DELETED,
						data: obj1[key]
					};
					continue;
				}

				const value2 = obj2[key];
				const result = this.map(obj1[key], value2);
				if (result) {
					diff[key] = result
				} else {
					unchanged.add(key);
				}
			}
			for (let key in obj2) {
				if (this.isFunction(obj2[key]) || diff[key] !== undefined || unchanged.has(key)) {
					continue;
				}

				if (!obj1.hasOwnProperty(key)) {
					diff[key] = {
						type: this.VALUE_CREATED,
						data: obj1[key]
					};
					continue;
				}

				const result = this.map(undefined, obj2[key]);
				if (result) {
					diff[key] = result
				}
			}

			if (Object.keys(diff).length === 0) { // {}
				return undefined
			} else {
				return diff
			}

		},
		compareValues: function (value1, value2) {
			if (value1 === value2) {
				return this.VALUE_UNCHANGED;
			}
			if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
				return this.VALUE_UNCHANGED;
			}
			if (value1 === undefined) {
				return this.VALUE_CREATED;
			}
			if (value2 === undefined) {
				return this.VALUE_DELETED;
			}
			return this.VALUE_UPDATED;
		},
		isFunction: function (x) {
			return Object.prototype.toString.call(x) === '[object Function]';
		},
		isArray: function (x) {
			return Object.prototype.toString.call(x) === '[object Array]';
		},
		isDate: function (x) {
			return Object.prototype.toString.call(x) === '[object Date]';
		},
		isObject: function (x) {
			return Object.prototype.toString.call(x) === '[object Object]';
		},
		isValue: function (x) {
			return !this.isObject(x) && !this.isArray(x);
		}
	}
}();
