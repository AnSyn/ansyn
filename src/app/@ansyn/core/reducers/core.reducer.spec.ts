import { coreInitialState, CoreReducer, ICoreState } from './core.reducer';
import { CasesReducer, ICasesState, initialCasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { SelectCaseAction } from '@ansyn/core/actions/core.actions';
import { Case } from '@ansyn/menu-items/cases/models/case.model';

describe('CoreReducer', () => {
	it('check initial state ', () => {
		expect(coreInitialState.toastMessage).toBe(null);
	});

	it('SELECT_CASE action should set selectedCase from payload', () => {
		const fakeCase = { id: 'fakeCaseId', state: <any> { a: 'b', c: 'd'} } as Case;

		let action: SelectCaseAction = new SelectCaseAction(fakeCase);
		let result: ICoreState = CoreReducer(coreInitialState, action);
		expect(result.selectedCase).toEqual(<any>{ id: 'fakeCaseId' });
	});
});
