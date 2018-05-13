import {
	AddMenuItemAction,
	MenuActionTypes,
	SelectMenuItemAction,
	SetBadgeAction,
	UnSelectMenuItemAction
} from '../actions/menu.actions';
import { sessionData, updateSession } from '../helpers/menu-session.helper';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { MenuItem } from '@ansyn/menu/models/menu-item.model';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Dictionary, EntitySelectors } from '@ngrx/entity/src/models';

export const menuItemsAdapter: EntityAdapter<MenuItem> = createEntityAdapter<MenuItem>({ selectId: (menuItem: MenuItem) => menuItem.name });

export interface IMenuState extends EntityState<MenuItem> {
	selectedMenuItem: string;
	isPinned: boolean;
	clickOutside: boolean;
}

export const initialMenuState: IMenuState = menuItemsAdapter.getInitialState({
	selectedMenuItem: sessionData().selectedMenuItem,
	isPinned: sessionData().isPinned,
	clickOutside: true
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
			return menuItemsAdapter.updateOne({ id: key, changes: { ...state.entities[key], badge } }, state);

		case MenuActionTypes.TOGGLE_IS_PINNED:
			updateSession({ isPinned: action.payload });
			return { ...state, isPinned: action.payload, clickOutside: !action.payload };

		case MenuActionTypes.SET_CLICK_OUTSIDE:
			return { ...state, clickOutside: action.payload };
		default:
			return state;
	}
}

/* @ngrx/entity */
export const { selectAll, selectEntities }: EntitySelectors<MenuItem, IMenuState> = menuItemsAdapter.getSelectors();
export const selectAllMenuItems: MemoizedSelector<IMenuState, MenuItem[]> = createSelector(menuStateSelector, selectAll);
export const selectEntitiesMenuItems: MemoizedSelector<IMenuState, Dictionary<MenuItem>> = createSelector(menuStateSelector, selectEntities);

export const selectIsPinned = createSelector(menuStateSelector, (menu) => menu.isPinned);
export const selectClickOutside = createSelector(menuStateSelector, (menu) => menu.clickOutside);
export const selectSelectedMenuItem = createSelector(menuStateSelector, (menu) => menu.selectedMenuItem);


