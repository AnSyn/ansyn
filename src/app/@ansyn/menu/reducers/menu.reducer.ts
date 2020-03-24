import {
	AddMenuItemAction,
	MenuActionTypes,
	SelectMenuItemAction,
	SetBadgeAction,
	UnSelectMenuItemAction
} from '../actions/menu.actions';
import { getMenuSessionData, setMenuSessionData } from '../helpers/menu-session.helper';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { IMenuItem } from '../models/menu-item.model';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Dictionary, EntitySelectors } from '@ngrx/entity/src/models';

export const menuItemsAdapter: EntityAdapter<IMenuItem> = createEntityAdapter<IMenuItem>({ selectId: (menuItem: IMenuItem) => menuItem.name });

export interface IMenuState extends EntityState<IMenuItem> {
	selectedMenuItem: string;
	isPinned: boolean;
	autoClose: boolean;
	menuCollapse: boolean;
	isUserFirstEntrance: boolean;
	doesUserHaveCredentials: boolean;
}

const menuSession = getMenuSessionData();
export const initialMenuState: IMenuState = menuItemsAdapter.getInitialState({
	selectedMenuItem: menuSession.selectedMenuItem,
	isPinned: menuSession.isPinned,
	autoClose: true,
	menuCollapse: false,
	isUserFirstEntrance: menuSession.isUserFirstEntrance,
	doesUserHaveCredentials: menuSession.doesUserHaveCredentials
});

export const menuFeatureKey = 'menu';

export const menuStateSelector: MemoizedSelector<any, IMenuState> = createFeatureSelector<IMenuState>(menuFeatureKey);

export type MenuActions = AddMenuItemAction | SelectMenuItemAction | UnSelectMenuItemAction | SetBadgeAction;

export function MenuReducer(state: IMenuState = initialMenuState, action: MenuActions) {

	switch (action.type) {
		case MenuActionTypes.INITIALIZE_MENU_ITEMS: {
			return menuItemsAdapter.addAll(action.payload, state);
		}
		case MenuActionTypes.ADD_MENU_ITEM:
			return menuItemsAdapter.addOne(action.payload, state);

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
			return menuItemsAdapter.updateOne({ id: key, changes: { ...state.entities[key], badge } }, state);

		case MenuActionTypes.TOGGLE_IS_PINNED:
			setMenuSessionData({ isPinned: action.payload });
			return { ...state, isPinned: action.payload, clickOutside: !action.payload };

		case MenuActionTypes.SET_AUTO_CLOSE:
			return { ...state, autoClose: action.payload };

		case MenuActionTypes.MENU_COLLAPSE:
			return { ...state, menuCollapse: action.payload };

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

/* @ngrx/entity */
export const { selectAll, selectEntities }: EntitySelectors<IMenuItem, IMenuState> = menuItemsAdapter.getSelectors();
export const selectAllMenuItems: MemoizedSelector<IMenuState, IMenuItem[]> = createSelector(menuStateSelector, selectAll);
export const selectEntitiesMenuItems: MemoizedSelector<IMenuState, Dictionary<IMenuItem>> = createSelector(menuStateSelector, selectEntities);

export const selectIsPinned = createSelector(menuStateSelector, (menu) => menu && menu.isPinned);
export const selectAutoClose = createSelector(menuStateSelector, (menu) => menu.autoClose);
export const selectSelectedMenuItem = createSelector(menuStateSelector, (menu) => menu.selectedMenuItem);
export const selectMenuCollapse = createSelector(menuStateSelector, (menu) => menu.menuCollapse);
export const selectUserFirstEnter = createSelector(menuStateSelector, (menu) => menu.isUserFirstEntrance);
export const selectUserHaveCredentials = createSelector(menuStateSelector, (menu) => menu.doesUserHaveCredentials);

