import { AddMenuItemAction, MenuActionTypes, SelectMenuItemAction, UnSelectMenuItemAction } from '../actions';
import { SetBadgeAction } from '../actions/menu.actions';
import { MenuItem } from '../models';
import { isDevMode } from '@angular/core';
import { sessionData, updateSession } from '../helpers/menu-session.helper';
import { createFeatureSelector, MemoizedSelector } from '@ngrx/store';
import { localStorageData, updateLocalStorage } from '@ansyn/menu/helpers/menu-local-storage.helper';

export interface IMenuState {
	menuItems: Map<string, MenuItem>;
	selectedMenuItem: string;
	isPinned: boolean;
	clickOutside: boolean;
	showHelpOnStartup: boolean;
	doneStartupOperations: boolean;
}

export const initialMenuState: IMenuState = {
	menuItems: new Map(),
	selectedMenuItem: (sessionData().doneStartupOperations ?
			sessionData().selectedMenuItem
			: (localStorageData().showHelpOnStartup ?
				'Help'
				: sessionData().selectedMenuItem)
	),
	isPinned: sessionData().isPinned,
	clickOutside: true,
	showHelpOnStartup: localStorageData().showHelpOnStartup,
	doneStartupOperations: sessionData().doneStartupOperations
};

export const menuFeatureKey = 'menu';

export const menuStateSelector: MemoizedSelector<any, IMenuState> = createFeatureSelector<IMenuState>(menuFeatureKey);

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
			const menuItemsHandler = new Map<string, MenuItem>(state.menuItems);
			const menuItem = menuItemsHandler.get(key);
			menuItem.badge = badge;
			menuItemsHandler.set(key, menuItem);
			return { ...state, menuItems: menuItemsHandler };

		case MenuActionTypes.TOGGLE_IS_PINNED:
			updateSession({ isPinned: action.payload });
			return { ...state, isPinned: action.payload };

		case MenuActionTypes.SET_CLICK_OUTSIDE:
			return { ...state, clickOutside: action.payload };

		case MenuActionTypes.SET_SHOW_HELP_ON_STARTUP:
			updateLocalStorage({ showHelpOnStartup: action.payload });
			return { ...state, showHelpOnStartup: action.payload };

		case MenuActionTypes.SET_DONE_STARTUP_OPERATIONS:
			updateSession({ doneStartupOperations: action.payload });
			return { ...state, doneStartupOperations: action.payload };

		default:
			return state;
	}
}
