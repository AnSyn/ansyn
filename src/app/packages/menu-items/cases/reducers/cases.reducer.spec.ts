import {
	AddCaseSuccessAction,
	CloseModalAction,
	DeleteCaseAction,
	LoadCasesSuccessAction,
	OpenModalAction,
	SelectCaseAction,
	UpdateCaseAction,
	UpdateCaseBackendAction,
	UpdateCaseBackendSuccessAction
} from '../actions/cases.actions';
import { Case } from '../models/case.model';
import { CasesReducer, ICasesState, initialCasesState } from './cases.reducer';

describe('CasesReducer', () => {

	it('CASE_SUCCESS action should add new case to state', () => {
		let new_case: Case = {
			id: 'fake_id',
			name: 'fake_name'
		};
		let action: AddCaseSuccessAction = new AddCaseSuccessAction(new_case);
		let result: ICasesState = CasesReducer(initialCasesState, action);
		expect(result.cases).toEqual([new_case]);
	});

	it('OPEN_MODAL action should set modalCaseId from payload and change modal to true', () => {
		let action: OpenModalAction = new OpenModalAction({ component: 'fake', case_id: 'fake_case_id' });
		let result: ICasesState = CasesReducer(initialCasesState, action);
		expect(result.modal).toBeTruthy();
	});

	it('CLOSE_MODAL action should change modalCaseId to null and change modal to true', () => {
		let action: CloseModalAction = new CloseModalAction();
		let result: ICasesState = CasesReducer(initialCasesState, action);
		expect(result.modal).toBeFalsy();
	});

	it('SELECT_CASE action should set selectedCase from payload', () => {
		const fakeCase = { id: 'fakeCaseId' } as Case;
		let action: SelectCaseAction = new SelectCaseAction(fakeCase);
		let result: ICasesState = CasesReducer(initialCasesState, action);
		expect(result.selectedCase).toEqual(fakeCase);
	});

	it('UPDATE_CASE action should update existing case from payload(by "id") ', () => {
		let state: ICasesState = initialCasesState;
		state.cases = [
			{ id: 'id1', name: 'name1' },
			{ id: 'id2', name: 'name2' },
			{ id: 'id3', name: 'name3' }
		];

		state.modalCaseId = 'id2';

		let new_case: Case = {
			id: 'id2', name: 'name2 lastname2'
		};

		let action: UpdateCaseAction = new UpdateCaseAction(new_case);
		let result: ICasesState = CasesReducer(state, action);
		expect(result.cases[1].name).toEqual('name2 lastname2');
	});

	it('UPDATE_CASE_BACKEND action should change updatingBackend to "true" ', () => {
		const state: ICasesState = initialCasesState;
		const case_payload: Case = { id: '6' };
		let action: UpdateCaseBackendAction = new UpdateCaseBackendAction(case_payload);
		let result: ICasesState = CasesReducer(state, action);
		expect(result.updatingBackend).toBeTruthy();
	});

	it('UPDATE_CASE_BACKEND_SUCCESS action should change updatingBackend to "false" ', () => {
		const state: ICasesState = initialCasesState;
		const case_payload: Case = { id: '6' };
		let action: UpdateCaseBackendSuccessAction = new UpdateCaseBackendSuccessAction(case_payload);
		let result: ICasesState = CasesReducer(state, action);
		expect(result.updatingBackend).toBeFalsy();
	});

	it('LOAD_CASES_SUCCESS action should add cases from payload to state.cases', () => {
		let state: ICasesState = initialCasesState;
		state.cases = [
			{ id: 'id1', name: 'name1' },
			{ id: 'id2', name: 'name2' },
			{ id: 'id3', name: 'name3' }
		];
		let cases_loaded: Case[] = [
			{ id: 'id4', name: 'name4' },
			{ id: 'id5', name: 'name5' },
			{ id: 'id6', name: 'name6' }
		];
		let action: LoadCasesSuccessAction = new LoadCasesSuccessAction(cases_loaded);
		let result: ICasesState = CasesReducer(state, action);
		expect(result.cases.length).toEqual(6);
	});

	it('DELETE_CASE action should delete case from state.cases by modalCaseId', () => {
		let state: ICasesState = initialCasesState;
		state.cases = [
			{ id: 'id1', name: 'name1' },
			{ id: 'id2', name: 'name2' },
			{ id: 'id3', name: 'name3' }
		];
		state.modalCaseId = 'id1';
		let action: DeleteCaseAction = new DeleteCaseAction();
		let result: ICasesState = CasesReducer(state, action);
		expect(result.cases.length).toEqual(2);
	});

});
