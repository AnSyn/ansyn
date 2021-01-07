import { ElementRef } from '@angular/core';
import { Action } from '@ngrx/store';
import { ILogMessage } from '../models/logger.model';
import { IOutsideMenuItem } from '../models/menu-item.model';

export const MenuActionTypes = {
	SELECT_MENU_ITEM: 'SELECT_MENU_ITEM',
	SELECT_MENU_ITEM_FROM_OUTSIDE: 'SELECT_MENU_ITEM_FROM_OUTSIDE',
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
	LOG_HELP: 'LOG_HELP'
};

export class ResetAppAction implements Action, ILogMessage {
	type = MenuActionTypes.RESET_APP;

	constructor() {
	}

	logMessage() {
		return `*Resetting application* according to user request`
	}
}

export class SelectMenuItemAction implements Action, ILogMessage {
	type = MenuActionTypes.SELECT_MENU_ITEM;

	constructor(public payload: { menuKey: string, skipSession?: boolean }) {
	}

	logMessage() {
		return `Opening menu item: ${this.payload.menuKey}`
	}
}

export class SelectMenuItemFromOutsideAction implements Action, ILogMessage {
	type = MenuActionTypes.SELECT_MENU_ITEM_FROM_OUTSIDE;

	constructor(public payload: IOutsideMenuItem) {
	}

	logMessage() {
		return `Opening menu item from outside: ${this.payload.name}`
	}
}

export class UnSelectMenuItemAction implements Action, ILogMessage {
	type = MenuActionTypes.UNSELECT_MENU_ITEM;

	constructor(public payload?: any) {
	}

	logMessage() {
		return `Closing current menu item`
	}
}

export class SetBadgeAction implements Action {
	type = MenuActionTypes.SET_BADGE;

	constructor(public payload: { key: string, badge: string }) {
	}
}

export class ToggleIsPinnedAction implements Action, ILogMessage {
	type = MenuActionTypes.TOGGLE_IS_PINNED;

	constructor(public payload: boolean) {
	}

	logMessage() {
		return `${this.payload ? 'Pinning' : 'Unpinning'} current menu item`
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

export class ToggleMenuCollapse implements Action, ILogMessage {
	type = MenuActionTypes.MENU_COLLAPSE;

	constructor(public payload: boolean) {
	}

	logMessage() {
		return `${this.payload ? '' : 'Un-'}Hiding menu`
	}
}

export class LogHelp implements Action, ILogMessage {
	type = MenuActionTypes.LOG_HELP;

	constructor(public payload?: any) {
	}

	logMessage() {
		return `User clicked on Help button`
	}
}
