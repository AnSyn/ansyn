import { HelpLocalStorageState } from '@ansyn/menu-items/help/models/help.local-storage-state.model';

export function localStorageData(): HelpLocalStorageState {
	const helpState: HelpLocalStorageState = JSON.parse(localStorage.getItem('ansynHelpState'));
	return helpState ? helpState : { showHelpOnStartup: true };
}

export function updateLocalStorage(data: HelpLocalStorageState) {
	const localStorageState = localStorageData();
	const updatedLocalStorageState = JSON.stringify({ ...localStorageState, ...data });
	localStorage.setItem('ansynHelpState', updatedLocalStorageState);
}
