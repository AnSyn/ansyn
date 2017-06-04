import {
	AddCaseSuccessAction, CloseModalAction, DeleteCaseSuccessAction, LoadCasesSuccessAction, OpenModalAction,
	SelectCaseByIdAction,
	UpdateCaseSuccessAction
} from '../actions/cases.actions';
import { Case } from '../models/case.model';
import { CasesReducer, ICasesState, initialCasesState } from './cases.reducer';

describe('CasesReducer', () =>{

	it('CASE_SUCCESS action should add new case to state', () => {
		let new_case: Case = {
			id: 'fake_id',
			name: 'fake_name'
		};
		let action: AddCaseSuccessAction = new AddCaseSuccessAction(new_case);
		let result: ICasesState = CasesReducer(initialCasesState, action);
		expect(result.cases).toEqual([new_case])
	});

	it('OPEN_MODAL action should set active_case_id from payload and change modal to true', () => {
		let action: OpenModalAction = new OpenModalAction({component: 'fake', case_id: 'fake_case_id'});
		let result: ICasesState = CasesReducer(initialCasesState, action);
		expect(result.modal).toBeTruthy();
		expect(result.active_case_id).toEqual('fake_case_id');
	});

	it('CLOSE_MODAL action should change active_case_id to null and change modal to true', () => {
		let action: CloseModalAction = new CloseModalAction();
		let result: ICasesState = CasesReducer(initialCasesState, action);
		expect(result.modal).toBeFalsy();
		expect(result.active_case_id).toBeNull();
	});

	it('SELECT_CASE action should set selected_case_id from payload', () => {
		let state: ICasesState = initialCasesState;
		state.cases = [
			{id: 'fake_case_id', name:'fake_case_name1'},
		];
		let action: SelectCaseByIdAction = new SelectCaseByIdAction('fake_case_id');
		let result: ICasesState = CasesReducer(initialCasesState, action);
		expect(result.selected_case.id).toEqual('fake_case_id');
	});

	it('UPDATE_CASE_SUCCESS action should update existing case from payload(by "id") ', () => {
		let state: ICasesState = initialCasesState;
		state.cases = [
			{id: 'id1', name:'name1'},
			{id: 'id2', name:'name2'},
			{id: 'id3', name:'name3'}
		];

		state.active_case_id = 'id2';

		let new_case: Case = {
			id:'id2', name:'name2 lastname2'
		};

		let action: UpdateCaseSuccessAction = new UpdateCaseSuccessAction(new_case);
		let result: ICasesState = CasesReducer(state, action);
		expect(result.cases[1].name).toEqual('name2 lastname2');
	});

	it('LOAD_CASES_SUCCESS action should add cases from payload to state.cases', () => {
		let state: ICasesState = initialCasesState;
		state.cases = [
			{id: 'id1', name:'name1'},
			{id: 'id2', name:'name2'},
			{id: 'id3', name:'name3'}
		];
		let cases_loaded: Case[] = [
			{id:'id4', name:'name4'},
			{id:'id5', name:'name5'},
			{id:'id6', name:'name6'}
		];
		let action: LoadCasesSuccessAction = new LoadCasesSuccessAction(cases_loaded);
		let result: ICasesState = CasesReducer(state, action);
		expect(result.cases.length).toEqual(6);
	});

	it('DELETE_CASE_SUCCESS action should delete case from state.cases by active_case_id', () => {
		let state: ICasesState = initialCasesState;
		state.cases = [
			{id: 'id1', name:'name1'},
			{id: 'id2', name:'name2'},
			{id: 'id3', name:'name3'}
		];
		state.active_case_id = 'id1';
		let action: DeleteCaseSuccessAction = new DeleteCaseSuccessAction();
		let result: ICasesState = CasesReducer(state, action);
		expect(result.cases.length).toEqual(2);
	});
});
