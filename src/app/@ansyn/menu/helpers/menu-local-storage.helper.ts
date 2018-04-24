import { MenuLocalStorageState } from '@ansyn/menu/models/menu-local-storage-state.model';

export function localStorageData(): MenuLocalStorageState {
	const menuState: MenuLocalStorageState = JSON.parse(localStorage.getItem('ansynMenuState'));
	return menuState ? menuState : { showHelpOnStartup: true };
}

export function updateLocalStorage(data: MenuLocalStorageState) {
	const localStorageState = localStorageData();
	const updatedLocalStorageState = JSON.stringify({ ...localStorageState, ...data });
	localStorage.setItem('ansynMenuState', updatedLocalStorageState);
}
