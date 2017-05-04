import { Action } from '@ngrx/store';
import { MenuItem } from '../models/menu-item.model';

export const CoreActionTypes = {
	ADD_MENU_ITEM: 'ADD_MENU_ITEM',
	SELECT_MENU_ITEM: 'SELECT_MENU_ITEM',
	UNSELECT_MENU_ITEM: 'UNSELECT_MENU_ITEM'
};

export class AddMenuItemAction implements Action {
	type = CoreActionTypes.ADD_MENU_ITEM;
	constructor(public payload: MenuItem){}
}
export class SelectMenuItemAction implements Action {
	type = CoreActionTypes.SELECT_MENU_ITEM;
	constructor(public payload: number){}
}
export class UnSelectMenuItemAction implements Action {
	type = CoreActionTypes.UNSELECT_MENU_ITEM;
	constructor(public payload?: any){}
}
