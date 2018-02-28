import {
	CloseModalAction,
	OpenModalAction,
	SelectCaseAction,
	UpdateCaseAction,
} from '../actions/cases.actions';
import { Case } from '../models/case.model';
import { CasesReducer, ICasesState, initialCasesState } from './cases.reducer';
import { AddCaseAction, casesAdapter, CasesService } from '@ansyn/menu-items';


describe('CasesReducer', () => {

	it('ADD_CASE action should add new case to state', () => {
		let newCase: Case = {
			id: 'fakeId',
			name: 'fakeName'
		};
		let action = new AddCaseAction(newCase);
		let result: ICasesState = CasesReducer(initialCasesState, action);
		expect(result.entities['fakeId']).toEqual(newCase);
	});

	it('OPEN_MODAL action should set modalCaseId from payload and change modal to true', () => {
		let action: OpenModalAction = new OpenModalAction({ component: 'fake', caseId: 'fakeCaseId' });
		let result: ICasesState = CasesReducer(initialCasesState, action);
		expect(result.modal).toBeTruthy();
	});

	it('CLOSE_MODAL action should change modalCaseId to null and change modal to true', () => {
		let action: CloseModalAction = new CloseModalAction();
		let result: ICasesState = CasesReducer(initialCasesState, action);
		expect(result.modal).toBeFalsy();
	});

	it('SELECT_CASE action should set selectedCase from payload', () => {
		const fakeCase = { id: 'fakeCaseId', state: {} } as Case;

		let action: SelectCaseAction = new SelectCaseAction(fakeCase);
		let result: ICasesState = CasesReducer(initialCasesState, action);
		expect(result.selectedCase).toEqual(<any>{ ...fakeCase, state: { time: CasesService.defaultTime } });
	});

	it('UPDATE_CASE action should update existing case from payload(by "id") ', () => {
		let state: ICasesState = { ...initialCasesState };
		state = casesAdapter.addAll(<any>[
			{ id: 'id1', name: 'name1' },
			{ id: 'id2', name: 'name2' },
			{ id: 'id3', name: 'name3' }
		], state);

		state.modalCaseId = 'id2';
		state.selectedCase = {};

		let newCase: Case = {
			id: 'id2', name: 'name2 lastname2'
		};

		let action: UpdateCaseAction = new UpdateCaseAction(newCase);
		let result: ICasesState = CasesReducer(state, action);
		expect(result.entities['id2'].name).toEqual('name2 lastname2');
	});

});
