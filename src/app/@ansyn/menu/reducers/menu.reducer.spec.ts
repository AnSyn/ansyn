import { IMenuState, initialMenuState, MenuReducer } from './menu.reducer';
import { SelectMenuItemAction, UnSelectMenuItemAction } from '../actions/menu.actions';

describe('MenuReducer', () => {

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
