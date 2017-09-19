import {
	AddMenuItemAction,
	MenuActionTypes,
	MenuItem,
	SelectMenuItemAction,
	UnSelectMenuItemAction
} from '../';
import { SetBadgeAction } from '../actions/menu.actions';

export interface IMenuState {
	menu_items: MenuItem[];
	selected_menu_item_index: number;
	animation: boolean;
}

export const initialMenuState: IMenuState = {
	menu_items: [],
	selected_menu_item_index: -1,
	animation: false
};

export type MenuActions = AddMenuItemAction | SelectMenuItemAction | UnSelectMenuItemAction | SetBadgeAction;

export function MenuReducer(state: IMenuState = initialMenuState, action: MenuActions) {

	switch (action.type) {
		case MenuActionTypes.ADD_MENU_ITEM:
			let menu_items: MenuItem[] = [
				...state.menu_items,
				action.payload,
			];
			return Object.assign({}, state, { menu_items });

		case MenuActionTypes.SELECT_MENU_ITEM:
			return Object.assign({}, state, { selected_menu_item_index: action.payload, animation: true });

		case MenuActionTypes.UNSELECT_MENU_ITEM:
			return Object.assign({}, state, { selected_menu_item_index: -1, animation: true });

		case MenuActionTypes.ANIMATION_START:
			return Object.assign({}, state, { animation: true });

		case MenuActionTypes.ANIMATION_END:
			return Object.assign({}, state, { animation: false });

		case MenuActionTypes.SET_BADGE: {
			const { index, badge } = action.payload ;
			const menuItem = state.menu_items[index];
			menuItem.badge = badge;
			const size = state.menu_items.length;
			const menu_items = [
				state.menu_items.slice(0, index),
				menuItem,
				state.menu_items.slice(index + 1, size),
			];
			return {...state, menu_items};
		}

		default:
			return state;
	}
}
