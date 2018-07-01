import { MenuSessionState } from '../models/menu-session-state.model';

export function getMenuSessionData(): MenuSessionState {
	return JSON.parse(sessionStorage.getItem('menuState'));
}

export function setMenuSessionData(data: MenuSessionState) {
	const sessionState = getMenuSessionData();
	const updatedSessionState = JSON.stringify({ ...sessionState, ...data });
	sessionStorage.setItem('menuState', updatedSessionState);
}
