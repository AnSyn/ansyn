import { AddMenuItemAction, MenuActionTypes, SelectMenuItemAction, UnSelectMenuItemAction } from '../actions';
import { SetBadgeAction } from '../actions/menu.actions';
import { MenuItem } from '../models';
import { isDevMode } from '@angular/core';

export interface IMenuState {
	menuItems: Map<string, MenuItem>;
	selectedMenuItem: string;
	isPinned: boolean;
}

export const initialMenuState: IMenuState = {
	menuItems: new Map(),
	selectedMenuItem: '',
	isPinned: false
};

export type MenuActions = AddMenuItemAction | SelectMenuItemAction | UnSelectMenuItemAction | SetBadgeAction;

const isMenuItemShown = (menuItem: MenuItem) => isDevMode() || menuItem.production;

export function MenuReducer(state: IMenuState = initialMenuState, action: MenuActions) {

	switch (action.type) {
		case MenuActionTypes.INITIALIZE_MENU_ITEMS: {
			const menuItems = new Map();
			action.payload.forEach((menuItem: MenuItem) => {
				if (isMenuItemShown(menuItem)) {
					menuItems.set(menuItem.name, menuItem);
				}
			});
			return { ...state, menuItems };
		}
		case MenuActionTypes.ADD_MENU_ITEM:
			const menuItems = new Map(state.menuItems);
			if (isMenuItemShown(action.payload)) {
				menuItems.set(action.payload.name, action.payload);
			}
			return { ...state, menuItems };

		case MenuActionTypes.SELECT_MENU_ITEM:
			return { ...state, selectedMenuItem: action.payload };

		case MenuActionTypes.UNSELECT_MENU_ITEM:
			return { ...state, selectedMenuItem: '' };

		case MenuActionTypes.SET_BADGE:
			const { key, badge } = action.payload;
			const menuItemsHandler = new Map<string, MenuItem>(state.menuItems);
			const menuItem = menuItemsHandler.get(key);
			menuItem.badge = badge;
			menuItemsHandler.set(key, menuItem);
			return { ...state, menuItems: menuItemsHandler };

		case MenuActionTypes.TOGGLE_IS_PINNED:
			return { ...state, isPinned: action.payload };

		default:
			return state;
	}
}
