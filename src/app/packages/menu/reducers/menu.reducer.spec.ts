import { AddMenuItemAction, MenuItem, SelectMenuItemAction, UnSelectMenuItemAction } from '@ansyn/core';
import { IMenuState, initialMenuState, MenuReducer } from './menu.reducer';

describe('MenuReducer', () => {

	it('ADD_MENU_ITEM action should add new menu_item to state', () => {
		let menu_item: MenuItem = {
			name: 'fake_menu_item',
			icon_url: 'fake/icon/url',
			component: 'component'
		};
		let action: AddMenuItemAction = new AddMenuItemAction(menu_item);
		let result: IMenuState = MenuReducer(initialMenuState, action);
		expect(result.menu_items).toEqual([menu_item]);
	});


	it('SELECT_MENU_ITEM action should set selected_menu_item_index with action.payload', () => {
		let select_action: SelectMenuItemAction = new SelectMenuItemAction(1);
		let result: IMenuState = MenuReducer(initialMenuState, select_action);
		expect(result.selected_menu_item_index).toEqual(1);
	});

	it('UNSELECT_MENU_ITEM action should set selected_menu_item_index with "-1"', () => {
		let unselect_action: UnSelectMenuItemAction = new UnSelectMenuItemAction();
		let result: IMenuState = MenuReducer(initialMenuState, unselect_action);
		expect(result.selected_menu_item_index).toEqual(-1);
	});

});
