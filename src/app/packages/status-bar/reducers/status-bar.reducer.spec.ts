
import { IStatusBarState, statusBarFlagsItems, StatusBarInitialState, StatusBarReducer } from './status-bar.reducer';
import { UpdateStatusFlagsAction } from '../actions/status-bar.actions';

describe('Status Bar Reducer', () => {
	it("update status flags - 'good' value",() => {
		const action = new UpdateStatusFlagsAction({
			key : statusBarFlagsItems.pinPointIndicator,
			value: true
		})

		const newState = StatusBarReducer(StatusBarInitialState,action);
		expect(newState.flags.get(statusBarFlagsItems.pinPointIndicator)).toBe(true);

	});

	it("update status flags - 'bed' value",() => {
		const action = new UpdateStatusFlagsAction({
			key : "TMP",
			value: true
		})

		const newState = StatusBarReducer(StatusBarInitialState,action);
		expect(newState.flags.size).toBe(0);

	});
});
