import { StatusBarInitialState, StatusBarReducer } from './status-bar.reducer';
import { UpdateGeoFilterStatus } from '@ansyn/status-bar/actions/status-bar.actions';
import { CaseGeoFilter } from '@ansyn/core/models/case.model';

describe('Status Bar Reducer', () => {
	let _reducerState;

	beforeEach(() => {
		_reducerState = Object.assign({}, StatusBarInitialState);
	});

	it('update geoFilter status', () => {
		const action = new UpdateGeoFilterStatus({ searchMode: CaseGeoFilter.PinPoint, indicator: true });
		const newState = StatusBarReducer(_reducerState, action);
		expect(newState.geoFilterStatus).toEqual({ searchMode: CaseGeoFilter.PinPoint, indicator: true });
	});
});
