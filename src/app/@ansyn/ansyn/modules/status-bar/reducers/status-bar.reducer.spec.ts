import { StatusBarInitialState, StatusBarReducer } from './status-bar.reducer';
import { UpdateGeoFilterStatus } from '../actions/status-bar.actions';
import { CaseGeoFilter } from '../../menu-items/cases/models/case.model';

describe('Status Bar Reducer', () => {
	let _reducerState;

	beforeEach(() => {
		_reducerState = Object.assign({}, StatusBarInitialState);
	});

	it('update geoFilter status', () => {
		const action = new UpdateGeoFilterStatus({ type: CaseGeoFilter.PinPoint, active: true });
		const newState = StatusBarReducer(_reducerState, action);
		expect(newState.geoFilterStatus).toEqual({ type: CaseGeoFilter.PinPoint, active: true });
	});
});
