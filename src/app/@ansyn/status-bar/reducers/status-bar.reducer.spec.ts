import { StatusBarInitialState, StatusBarReducer } from './status-bar.reducer';
import { UpdateStatusFlagsAction } from '../actions/status-bar.actions';
import { statusBarFlagsItemsEnum } from '../models/status-bar-flag-items.model';

describe('Status Bar Reducer', () => {
	let _reducerState;

	beforeEach(() => {
		_reducerState = Object.assign({}, StatusBarInitialState);
	});

	it('update status flags - \'good\' value', () => {
		const action = new UpdateStatusFlagsAction({
			key: statusBarFlagsItemsEnum.geoFilterIndicator,
			value: true
		});

		const newState = StatusBarReducer(_reducerState, action);
		expect(newState.flags.get(statusBarFlagsItemsEnum.geoFilterIndicator)).toBe(true);

	});
});
