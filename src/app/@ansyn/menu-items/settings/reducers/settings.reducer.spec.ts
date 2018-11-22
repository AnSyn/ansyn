import { settingsFlags, settingsInitialState } from './settings.reducer';

describe('SettingsReducer', () => {
	it('check initial state', () => {
		expect(settingsInitialState.flags.get(settingsFlags.isAnaglyphActive)).toBeFalsy();
	});
});
