import {
	CloseModalAction,
	OpenModalAction,
	SelectCaseAction,
	UpdateCaseAction,
} from '../actions/cases.actions';
import { Case } from '../models/case.model';
import { CasesReducer, ICasesState, initialCasesState } from './cases.reducer';
import { AddCaseAction, casesAdapter, CasesService } from '@ansyn/menu-items';
import { Overlay } from '@ansyn/core/models/overlay.model';
import {
	CaseGeoFilter, CaseOrientation, CaseRegionState, CaseTimeFilter, CaseTimeState,
	ImageManualProcessArgs
} from '@ansyn/core/models/case.model';


describe('CasesReducer', () => {
	const caseMock: Case = {
		id: 'fakeId',
		name: 'fakeName',
		owner: 'owner',
		creationTime: new Date(),
		lastModified: new Date(),
		state: {
			time: {
				type: 'absolute',
				from: new Date(),
				to: new Date()
			},
			orientation: 'Align North',
			timeFilter: 'Start - End',
			geoFilter: 'Pin-Point',
			region: {},
			overlaysManualProcessArgs: {}
		}
	};

	it('ADD_CASE action should add new case to state', () => {
		let action = new AddCaseAction(caseMock);
		let result: ICasesState = CasesReducer(initialCasesState, action);
		expect(result.entities['fakeId']).toEqual(caseMock);
	});

	it('OPEN_MODAL action should set modalCaseId from payload and change modal to true', () => {
		let action: OpenModalAction = new OpenModalAction({ component: 'fake', caseId: 'fakeCaseId' });
		let result: ICasesState = CasesReducer(initialCasesState, action);
		expect(result.modal.show).toBeTruthy();
	});

	it('CLOSE_MODAL action should change modalCaseId to null and change modal to true', () => {
		let action: CloseModalAction = new CloseModalAction();
		let result: ICasesState = CasesReducer(initialCasesState, action);
		expect(result.modal.show).toBeFalsy();
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

		state.modal.id = 'id2';
		state.selectedCase = { ...caseMock, id: 'id2'};

		let newCase: Case = {
			...caseMock, id: 'id2', name: 'name2 lastname2'
		};

		let action: UpdateCaseAction = new UpdateCaseAction(newCase);
		let result: ICasesState = CasesReducer(state, action);
		expect(result.entities['id2'].name).toEqual('name2 lastname2');
	});

});
