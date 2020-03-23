export interface IMenuSessionState {
	selectedMenuItem?: string;
	isPinned?: boolean;
	isUserFirstEntrance?: boolean;
}

export class MenuSession implements IMenuSessionState{
	selectedMenuItem: string;
	isPinned?: boolean;
	isUserFirstEntrance: boolean;
	doesUserHaveCredentials: boolean;

	constructor() {
		this.selectedMenuItem = '';
		this.isPinned = false;
		this.isUserFirstEntrance = true;
		this.doesUserHaveCredentials = true;
	}
}
