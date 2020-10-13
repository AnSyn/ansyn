import { Action } from '@ngrx/store';
import { IMenuItem } from '../models/menu-item.model';

export const MenuActionTypes = {
	SELECT_MENU_ITEM: 'SELECT_MENU_ITEM',
	UNSELECT_MENU_ITEM: 'UNSELECT_MENU_ITEM',
	SET_BADGE: 'SET_BADGE',
	TOGGLE_IS_PINNED: 'TOGGLE_IS_PINNED',
	TRIGGER: {
		CONTAINER_CHANGED: 'CONTAINER_CHANGED'
	},
	SET_AUTO_CLOSE: 'SET_AUTO_CLOSE',
	MENU_COLLAPSE: 'MENU_COLLAPSE',
	RESET_APP: 'RESET_APP',
	SET_USER_ENTER: 'SET_USER_ENTER',
	SET_DOES_USER_HAVE_CREDENTIALS: 'SET_DOES_USER_HAVE_CREDENTIALS',
	RESET_APP_ACTION_SUCCESS: 'RESET_APP_ACTION_SUCCESS'
};

export class ResetAppAction implements Action {
	type = MenuActionTypes.RESET_APP;

	constructor() {
	}
}

export class SelectMenuItemAction implements Action {
	type = MenuActionTypes.SELECT_MENU_ITEM;

	constructor(public payload: { menuKey: string, skipSession?: boolean }) {
	}
}

export class UnSelectMenuItemAction implements Action {
	type = MenuActionTypes.UNSELECT_MENU_ITEM;

	constructor(public payload?: any) {
	}
}

export class SetBadgeAction implements Action {
	type = MenuActionTypes.SET_BADGE;

	constructor(public payload: { key: string, badge: string }) {
	}
}

export class ToggleIsPinnedAction implements Action {
	type = MenuActionTypes.TOGGLE_IS_PINNED;

	constructor(public payload: boolean) {
	}
}

export class ContainerChangedTriggerAction implements Action {
	type = MenuActionTypes.TRIGGER.CONTAINER_CHANGED;

	constructor(public payload?: any) {
	}
}

export class SetAutoClose implements Action {
	type = MenuActionTypes.SET_AUTO_CLOSE;

	constructor(public payload: boolean) {
	}
}

export class ToggleMenuCollapse implements Action {
	type = MenuActionTypes.MENU_COLLAPSE;

	constructor(public payload: boolean) {
	}
}
