import { IMenuSessionState } from '../models/menu-session-state.model';

class MenuSession {
	selectedMenuItem: string;
	isPinned?: boolean;
	isUserFirstEntrance: boolean;

	constructor() {
		this.selectedMenuItem = '';
		this.isPinned = false;
		this.isUserFirstEntrance = true;
	}
}

export function getMenuSessionData(): IMenuSessionState {
	const menuSession = JSON.parse(sessionStorage.getItem('menuState'));
	return menuSession ? menuSession : new MenuSession();
}

export function setMenuSessionData(data: IMenuSessionState) {
	const sessionState = getMenuSessionData();
	const updatedSessionState = JSON.stringify({ ...sessionState, ...data });
	sessionStorage.setItem('menuState', updatedSessionState);
}
