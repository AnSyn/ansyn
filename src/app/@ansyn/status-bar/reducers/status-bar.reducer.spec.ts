import { StatusBarInitialState, StatusBarReducer } from './status-bar.reducer';
import { UpdateStatusFlagsAction } from '../actions/status-bar.actions';
import { statusBarFlagsItemsEnum } from '@ansyn/status-bar';

describe('Status Bar Reducer', () => {
	let _reducerState;

	beforeEach(() => {
		_reducerState = Object.assign({}, StatusBarInitialState);
	});

	it('update status flags - \'good\' value', () => {
		const action = new UpdateStatusFlagsAction({
			key: statusBarFlagsItemsEnum.pinPointIndicator,
			value: true
		});

		const newState = StatusBarReducer(_reducerState, action);
		expect(newState.flags.get(statusBarFlagsItemsEnum.pinPointIndicator)).toBe(true);

	});

	it('update status flags - \'bad\' value', () => {
		const action = new UpdateStatusFlagsAction({
			key: <statusBarFlagsItemsEnum> 'TMP',
			value: true
		});

		// const newState = StatusBarReducer(_reducerState, action);
		expect(() => StatusBarReducer(_reducerState, action)).toThrow();

	});
});
