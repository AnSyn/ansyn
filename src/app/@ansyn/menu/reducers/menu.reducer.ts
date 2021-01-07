import {
	MenuActionTypes,
	SelectMenuItemAction,
	SetBadgeAction,
	UnSelectMenuItemAction
} from '../actions/menu.actions';
import { getMenuSessionData, setMenuSessionData } from '../helpers/menu-session.helper';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { IOutsideMenuItem } from '../models/menu-item.model';

export interface IMenuState {
	selectedMenuItem: string;
	selectedOutsideMenuItem: IOutsideMenuItem;
	isPinned: boolean;
	autoClose: boolean;
	badges: Map<string, string>;
	menuCollapse: boolean;
}

const menuSession = getMenuSessionData();
export const initialMenuState: IMenuState = {
	selectedMenuItem: menuSession.selectedMenuItem,
	isPinned: menuSession.isPinned,
	autoClose: true,
	badges: new Map(),
	menuCollapse: false,
	selectedOutsideMenuItem: {
		name: null,
		elementRef: null,
		toggleFromBottom: false
	}
};

export const menuFeatureKey = 'menu';

export const menuStateSelector: MemoizedSelector<any, IMenuState> = createFeatureSelector<IMenuState>(menuFeatureKey);

export type MenuActions = SelectMenuItemAction | UnSelectMenuItemAction | SetBadgeAction;

export function MenuReducer(state: IMenuState = initialMenuState, action: MenuActions) {

	switch (action.type) {
		case MenuActionTypes.SELECT_MENU_ITEM:
			const selectedMenuItem = action.payload.menuKey;
			if (!action.payload.skipSession) {
				setMenuSessionData({ selectedMenuItem });
			}
			return { ...state, selectedMenuItem };

		case MenuActionTypes.SELECT_MENU_ITEM_FROM_OUTSIDE:
			const selectedOutsideMenuItem = action.payload;
			return { ...state, selectedOutsideMenuItem };

		case MenuActionTypes.UNSELECT_MENU_ITEM: {
			const selectedMenuItem = '';
			setMenuSessionData({ selectedMenuItem });
			return { ...state, selectedMenuItem };
		}

		case MenuActionTypes.SET_BADGE:
			const { key, badge } = action.payload;
			const badges = new Map(state.badges);
			badges.set(key, badge);
			return {...state, badges};

		case MenuActionTypes.TOGGLE_IS_PINNED:
			setMenuSessionData({ isPinned: action.payload });
			return { ...state, isPinned: action.payload, clickOutside: !action.payload };

		case MenuActionTypes.SET_AUTO_CLOSE:
			return { ...state, autoClose: action.payload };

		case MenuActionTypes.MENU_COLLAPSE:
			return { ...state, menuCollapse: action.payload };

		default:
			return state;
	}
}

export const selectIsPinned = createSelector(menuStateSelector, (menu) => menu?.isPinned);
export const selectAutoClose = createSelector(menuStateSelector, (menu) => menu?.autoClose);
export const selectSelectedMenuItem = createSelector(menuStateSelector, (menu) => menu?.selectedMenuItem);
export const selectSelectedOutsideMenuItem = createSelector(menuStateSelector, (menu) => menu?.selectedOutsideMenuItem);
export const selectMenuCollapse = createSelector(menuStateSelector, (menu) => menu?.menuCollapse);
export const selectBadges = createSelector(menuStateSelector, (menu) => menu?.badges);
