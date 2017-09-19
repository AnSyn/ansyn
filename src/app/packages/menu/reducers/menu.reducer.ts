import { AddMenuItemAction, MenuActionTypes, MenuItem, SelectMenuItemAction, UnSelectMenuItemAction } from '../';
import { SetBadgeAction } from '../actions/menu.actions';

export interface IMenuState {
	menuItems: Map<string, MenuItem>;
	selectedMenuItem: string;
	animation: boolean;
}

export const initialMenuState: IMenuState = {
	menuItems: new Map(),
	selectedMenuItem: '',
	animation: false
};

export type MenuActions = AddMenuItemAction | SelectMenuItemAction | UnSelectMenuItemAction | SetBadgeAction;

export function MenuReducer(state: IMenuState = initialMenuState, action: MenuActions) {

	switch (action.type) {
		case MenuActionTypes.ADD_MENU_ITEM:
			const menuItems = new Map(state.menuItems);
			menuItems.set(action.payload.name, action.payload);
			return { ...state, menuItems };

		case MenuActionTypes.SELECT_MENU_ITEM:
			return { ...state, selectedMenuItem: action.payload, animation: true };

		case MenuActionTypes.UNSELECT_MENU_ITEM:
			return { ...state, selectedMenuItem: '', animation: true };

		case MenuActionTypes.ANIMATION_START:
			return { ...state, animation: true };

		case MenuActionTypes.ANIMATION_END:
			return { ...state, animation: false };

		case MenuActionTypes.SET_BADGE: {
			const { key, badge } = action.payload;
			const menuItems = new Map(state.menuItems);
			const menuItem = menuItems.get(key);
			menuItem.badge = badge;
			menuItems.set(key, menuItem);
			return { ...state, menuItems };
		}

		default:
			return state;
	}
}
