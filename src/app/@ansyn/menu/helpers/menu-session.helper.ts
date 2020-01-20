import { MenuSession } from '../models/menu-session-state.model';

export function getMenuSessionData(): MenuSession {
	const menuSession = JSON.parse(sessionStorage.getItem('menuState'));
	return menuSession ? menuSession : new MenuSession();
}

export function setMenuSessionData(data: Partial<MenuSession>) {
	const sessionState = getMenuSessionData();
	const updatedSessionState = JSON.stringify({ ...sessionState, ...data });
	sessionStorage.setItem('menuState', updatedSessionState);
}
