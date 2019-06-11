import { Action } from '@ngrx/store';
import { IMenuItem } from '../models/menu-item.model';

export const MenuActionTypes = {
	INITIALIZE_MENU_ITEMS: 'INITIALIZE_MENU_ITEMS',
	ADD_MENU_ITEM: 'ADD_MENU_ITEM',
	SELECT_MENU_ITEM: 'SELECT_MENU_ITEM',
	UNSELECT_MENU_ITEM: 'UNSELECT_MENU_ITEM',
	SET_BADGE: 'SET_BADGE',
	TOGGLE_IS_PINNED: 'TOGGLE_IS_PINNED',
	TRIGGER: {
		CONTAINER_CHANGED: 'CONTAINER_CHANGED'
	},
	SET_AUTO_CLODE: 'SET_AUTO_CLODE',
	FOOTER_COLLAPSE: 'FOOTER_COLLAPSE'
};

export class InitializeMenuItemsAction implements Action {
	type = MenuActionTypes.INITIALIZE_MENU_ITEMS;

	constructor(public payload: IMenuItem[]) {
	}
}

export class AddMenuItemAction implements Action {
	type = MenuActionTypes.ADD_MENU_ITEM;

	constructor(public payload: IMenuItem) {
	}
}

export class SelectMenuItemAction implements Action {
	type = MenuActionTypes.SELECT_MENU_ITEM;

	constructor(public payload: string) {
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
	type = MenuActionTypes.SET_AUTO_CLODE;

	constructor(public payload: boolean) {
	}
}

export class ToggleFooter implements Action{
	type = MenuActionTypes.FOOTER_COLLAPSE;
}

