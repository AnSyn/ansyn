import {
	MenuActionTypes,
	SelectMenuItemAction,
	SetBadgeAction,
	UnSelectMenuItemAction
} from '../actions/menu.actions';
import { getMenuSessionData, setMenuSessionData } from '../helpers/menu-session.helper';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';

export interface IMenuBadges {
	menuItem: string,
	badge: string
}
export interface IMenuState {
	selectedMenuItem: string;
	isPinned: boolean;
	autoClose: boolean;
	badge: IMenuBadges;
	menuCollapse: boolean;
	isUserFirstEntrance: boolean;
	doesUserHaveCredentials: boolean;
	hideResultsTableBadge: boolean;
}

const menuSession = getMenuSessionData();
export const initialMenuState: IMenuState = {
	selectedMenuItem: menuSession.selectedMenuItem,
	isPinned: menuSession.isPinned,
	autoClose: true,
	badge: {menuItem: null, badge: ''},
	menuCollapse: false,
	isUserFirstEntrance: menuSession.isUserFirstEntrance,
	doesUserHaveCredentials: menuSession.doesUserHaveCredentials,
	hideResultsTableBadge: false
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

		case MenuActionTypes.UNSELECT_MENU_ITEM: {
			const selectedMenuItem = '';
			setMenuSessionData({ selectedMenuItem });
			return { ...state, selectedMenuItem };
		}

		case MenuActionTypes.SET_BADGE:
			const { key, badge } = action.payload;
			return { ...state, badge: {
				menuItem: key,
					badge
				}};

		case MenuActionTypes.TOGGLE_IS_PINNED:
			setMenuSessionData({ isPinned: action.payload });
			return { ...state, isPinned: action.payload, clickOutside: !action.payload };

		case MenuActionTypes.SET_AUTO_CLOSE:
			return { ...state, autoClose: action.payload };

		case MenuActionTypes.MENU_COLLAPSE:
			return { ...state, menuCollapse: action.payload };

		case MenuActionTypes.SET_HIDE_RESULTS_TABLE_BADGE:
			return { ...state, hideResultsTableBadge: action.payload };

		case MenuActionTypes.SET_DOES_USER_HAVE_CREDENTIALS:
			setMenuSessionData({ doesUserHaveCredentials: action.payload });
			return { ...state, doesUserHaveCredentials: action.payload };

		case MenuActionTypes.SET_USER_ENTER:
			setMenuSessionData({ isUserFirstEntrance: false });
			return { ...state, isUserFirstEntrance: false };
		default:
			return state;
	}
}

export const selectIsPinned = createSelector(menuStateSelector, (menu) => menu?.isPinned);
export const selectHideResultsTableBadge = createSelector(menuStateSelector, (menu) => menu?.hideResultsTableBadge);
export const selectAutoClose = createSelector(menuStateSelector, (menu) => menu?.autoClose);
export const selectSelectedMenuItem = createSelector(menuStateSelector, (menu) => menu?.selectedMenuItem);
export const selectMenuCollapse = createSelector(menuStateSelector, (menu) => menu?.menuCollapse);
export const selectUserFirstEnter = createSelector(menuStateSelector, (menu) => menu?.isUserFirstEntrance);
export const selectUserHaveCredentials = createSelector(menuStateSelector, (menu) => menu?.doesUserHaveCredentials);
export const selectBadge = createSelector(menuStateSelector, (menu) => menu?.badge);
