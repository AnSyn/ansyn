import {
	CloseModalAction,
	OpenModalAction,
	SelectCaseSuccessAction,
	UpdateCaseAction
} from '../actions/cases.actions';
import { myCasesAdapter, CasesReducer, ICasesState, initialCasesState } from './cases.reducer';
import { ICase } from '../models/case.model';

describe('CasesReducer', () => {
	const caseMock: ICase = {
		id: 'fakeId',
		name: 'fakeName',
		creationTime: new Date(),
		autoSave: false,
		state: {
			time: {
				from: new Date(),
				to: new Date()
			},
			dataInputFilters: { fullyChecked: true, filters: [] },
			region: {
				geometry: {},
				type: "Feature",
				properties: {}
			},
			overlaysImageProcess: {},
			overlaysTranslationData: {}
		}
	};

	it('OPEN_MODAL action should set modalCaseId from payload and change modal to true', () => {
		let action: OpenModalAction = new OpenModalAction({ type: 'save', caseId: 'fakeCaseId' });
		let result: ICasesState = CasesReducer(initialCasesState, action);
		expect(result.modal.show).toBeTruthy();
	});

	it('CLOSE_MODAL action should change modalCaseId to null and change modal to true', () => {
		let action: CloseModalAction = new CloseModalAction();
		let result: ICasesState = CasesReducer(initialCasesState, action);
		expect(result.modal.show).toBeFalsy();
	});

	it('SELECT_CASE_SUCCESS action should set selectedCase from payload', () => {
		const fakeCase = { id: 'fakeCaseId', state: {} } as ICase;

		let action: SelectCaseSuccessAction = new SelectCaseSuccessAction(fakeCase);
		let result: ICasesState = CasesReducer(initialCasesState, action);
		expect(result.selectedCase).toEqual(<any>fakeCase);
	});

	it('UPDATE_CASE action should update existing case from payload(by "id") ', () => {
		let state: ICasesState = { ...initialCasesState };
		state.myCases = myCasesAdapter.setAll(<any>[
			{ id: 'id1', name: 'name1' },
			{ id: 'id2', name: 'name2' },
			{ id: 'id3', name: 'name3' }
		], state.myCases);

		state.modal = {...state.modal, id: 'id2'};
		state.selectedCase = { ...caseMock, id: 'id2' };

		let newCase: ICase = {
			...caseMock, id: 'id2', name: 'name2 lastname2'
		};

		let action: UpdateCaseAction = new UpdateCaseAction(newCase);
		let result: ICasesState = CasesReducer(state, action);
		expect(result.selectedCase.name).toEqual('name2 lastname2');
	});

});
