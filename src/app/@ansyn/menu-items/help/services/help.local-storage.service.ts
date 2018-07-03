import { HelpLocalStorageState } from '@ansyn/menu-items/help/models/help.local-storage-state.model';

export class HelpLocalStorageService {
	getHelpLocalStorageData(): HelpLocalStorageState {
		const helpState: HelpLocalStorageState = JSON.parse(localStorage.getItem('ansynHelpState'));
		return helpState ? helpState : { dontShowHelpOnStartup: false };
	}

	setHelpLocalStorageData(data: HelpLocalStorageState) {
		const localStorageState = this.getHelpLocalStorageData();
		const updatedLocalStorageState = JSON.stringify({ ...localStorageState, ...data });
		localStorage.setItem('ansynHelpState', updatedLocalStorageState);
	}
}

