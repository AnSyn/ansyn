import {
	AddMenuItemAction, MenuActionTypes, SelectMenuItemAction, SetBadgeAction,
	UnSelectMenuItemAction
} from '../actions/menu.actions';
import { isDevMode } from '@angular/core';
import { sessionData, updateSession } from '../helpers/menu-session.helper';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { MenuItem } from '@ansyn/menu/models/menu-item.model';

export interface MenuItems {
	[key: string]: MenuItem;
};

export interface IMenuState {
	menuItems: MenuItems;
	selectedMenuItem: string;
	isPinned: boolean;
	clickOutside: boolean;
}

export const initialMenuState: IMenuState = {
	menuItems: {},
	selectedMenuItem: sessionData().selectedMenuItem,
	isPinned: sessionData().isPinned,
	clickOutside: true
};

export const menuFeatureKey = 'menu';

export const menuStateSelector: MemoizedSelector<any, IMenuState> = createFeatureSelector<IMenuState>(menuFeatureKey);

export type MenuActions = AddMenuItemAction | SelectMenuItemAction | UnSelectMenuItemAction | SetBadgeAction;

const isMenuItemShown = (menuItem: MenuItem) => isDevMode() || menuItem.production;

export function MenuReducer(state: IMenuState = initialMenuState, action: MenuActions) {

	switch (action.type) {
		case MenuActionTypes.INITIALIZE_MENU_ITEMS: {
			const menuItems = {};
			action.payload.forEach((menuItem: MenuItem) => {
				if (isMenuItemShown(menuItem)) {
					menuItems[menuItem.name] = menuItem;
				}
			});
			return { ...state, menuItems };
		}
		case MenuActionTypes.ADD_MENU_ITEM:
			if (!isMenuItemShown(action.payload)) {
				return state;
			}
			const menuItems = { ...state.menuItems, [action.payload.name]: action.payload };
			return { ...state, menuItems };

		case MenuActionTypes.SELECT_MENU_ITEM:
			const selectedMenuItem = action.payload;
			updateSession({ selectedMenuItem });
			return { ...state, selectedMenuItem };

		case MenuActionTypes.UNSELECT_MENU_ITEM: {
			const selectedMenuItem = '';
			updateSession({ selectedMenuItem });
			return { ...state, selectedMenuItem };
		}

		case MenuActionTypes.SET_BADGE:
			const { key, badge } = action.payload;
			const menuItem = state.menuItems[key];
			if (!menuItem) {
				return state;
			}
			return { ...state, menuItems: { ...state.menuItems, [key]: {...menuItem, badge } }};

		case MenuActionTypes.TOGGLE_IS_PINNED:
			updateSession({ isPinned: action.payload });
			return { ...state, isPinned: action.payload, clickOutside: !action.payload};

		case MenuActionTypes.SET_CLICK_OUTSIDE:
			return { ...state, clickOutside: action.payload };
		default:
			return state;
	}
}
export const selectMenuItems = createSelector(menuStateSelector, ({ menuItems }: IMenuState) => menuItems);
