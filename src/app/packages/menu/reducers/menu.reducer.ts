import { CoreActionTypes, MenuItem, AddMenuItemAction, SelectMenuItemAction, UnSelectMenuItemAction } from '@ansyn/core';

export interface IMenuState {
	menu_items: MenuItem[];
	selected_menu_item_index: number;
}

export const initialMenuState: IMenuState = {
	menu_items: [],
	selected_menu_item_index: -1
};

export type MenuActionTypes = AddMenuItemAction | SelectMenuItemAction | UnSelectMenuItemAction | any;

export function MenuReducer(state: IMenuState = initialMenuState, action: MenuActionTypes ) {

	switch (action.type) {
		case CoreActionTypes.ADD_MENU_ITEM:
			let menu_items: MenuItem[] = [
				...state.menu_items,
				action.payload,
			];
			return Object.assign({}, state, {menu_items});

		case CoreActionTypes.SELECT_MENU_ITEM:
			return Object.assign({}, state, {selected_menu_item_index: action.payload});

		case CoreActionTypes.UNSELECT_MENU_ITEM:
			return Object.assign({}, state, {selected_menu_item_index:  -1});
		default:
			return state;
	}
}
