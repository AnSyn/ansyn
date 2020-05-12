import { IMenuState, initialMenuState, MenuReducer } from './menu.reducer';
import { IMenuItem } from '../models/menu-item.model';
import { AddMenuItemAction, SelectMenuItemAction, UnSelectMenuItemAction } from '../actions/menu.actions';

describe('MenuReducer', () => {

	it('ADD_MENU_ITEM action should add new menuItem to state', () => {
		let menuItem: IMenuItem = {
			name: 'fakeMenuItem',
			iconClass: 'fake/icon/url',
			component: 'component'
		};
		let action: AddMenuItemAction = new AddMenuItemAction(menuItem);
		let result: IMenuState = MenuReducer(initialMenuState, action);
		expect(result.entities.fakeMenuItem).toEqual(menuItem);
	});


	it('SELECT_MENU_ITEM action should set selectedMenuItemIndex with action.payload', () => {
		let selectAction: SelectMenuItemAction = new SelectMenuItemAction({ menuKey: 'fakeMenuItem' });
		let result: IMenuState = MenuReducer(initialMenuState, selectAction);
		expect(result.selectedMenuItem).toEqual('fakeMenuItem');
	});

	it('UNSELECT_MENU_ITEM action should set selectedMenuItemIndex with "-1"', () => {
		let unselectAction: UnSelectMenuItemAction = new UnSelectMenuItemAction();
		let result: IMenuState = MenuReducer(initialMenuState, unselectAction);
		expect(result.selectedMenuItem).toEqual('');
	});

});
