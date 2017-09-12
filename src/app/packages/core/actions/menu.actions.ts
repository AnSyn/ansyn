import { Action } from '@ngrx/store';
import { MenuItem } from '../models/menu-item.model';

export const MenuActionTypes = {
	ADD_MENU_ITEM: 'ADD_MENU_ITEM',
	SELECT_MENU_ITEM: 'SELECT_MENU_ITEM',
	UNSELECT_MENU_ITEM: 'UNSELECT_MENU_ITEM',
	ANIMATION_START: 'ANIMATION_START',
	ANIMATION_END: 'ANIMATION_END'
};

export class AddMenuItemAction implements Action {
	type = MenuActionTypes.ADD_MENU_ITEM;

	constructor(public payload: MenuItem) {
	}
}

export class SelectMenuItemAction implements Action {
	type = MenuActionTypes.SELECT_MENU_ITEM;

	constructor(public payload: number) {
	}
}

export class UnSelectMenuItemAction implements Action {
	type = MenuActionTypes.UNSELECT_MENU_ITEM;

	constructor(public payload?: any) {
	}
}

export class AnimationStartAction implements Action {
	type = MenuActionTypes.ANIMATION_START;

	constructor(public payload?: any) {
	}
}

export class AnimationEndAction implements Action {
	type = MenuActionTypes.ANIMATION_END;

	constructor(public payload?: any) {
	}
}
