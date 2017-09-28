import { MenuSessionState } from '../models/menu-session-state.model';

export function sessionData(): MenuSessionState {
	const menuState: MenuSessionState = JSON.parse(sessionStorage.getItem('menuState'));
	return menuState ? menuState : { selectedMenuItem: '', isPinned: false };
}

export function updateSession(data: MenuSessionState) {
	const sessionState = sessionData();
	const updatedSessionState = JSON.stringify({ ...sessionState, ...data });
	sessionStorage.setItem('menuState', updatedSessionState);
}
