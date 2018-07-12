import { IMenuSessionState } from '../models/menu-session-state.model';

export function getMenuSessionData(): IMenuSessionState {
	return JSON.parse(sessionStorage.getItem('menuState'));
}

export function setMenuSessionData(data: IMenuSessionState) {
	const sessionState = getMenuSessionData();
	const updatedSessionState = JSON.stringify({ ...sessionState, ...data });
	sessionStorage.setItem('menuState', updatedSessionState);
}
