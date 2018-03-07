import { coreInitialState, CoreReducer } from './core.reducer';

describe('CoreReducer', () => {
	it('check initial state ', () => {
		expect(coreInitialState.toastMessage).toBe(null);
	});
});
