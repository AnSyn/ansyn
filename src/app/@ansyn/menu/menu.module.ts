import { ANALYZE_FOR_ENTRY_COMPONENTS, Inject, InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu/menu.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MenuConfig } from './models/menuConfig';
import { IMenuConfig } from './models/menu-config.model';
import { IMenuItem } from './models/menu-item.model';
import { Store, StoreModule } from '@ngrx/store';
import { InitializeMenuItemsAction } from './actions/menu.actions';
import { menuFeatureKey, MenuReducer } from './reducers/menu.reducer';
import { mergeArrays } from '../core/public_api';

export const MENU_ITEMS = new InjectionToken<IMenuItem[]>('MENU_ITEMS');

// @dynamic
@NgModule({
	imports: [
		CommonModule,
		StoreModule.forFeature(menuFeatureKey, MenuReducer),
		BrowserAnimationsModule
	],
	declarations: [MenuComponent],
	exports: [MenuComponent]
})
export class MenuModule {

	static provideMenuItems(menuItems: any[]): ModuleWithProviders {
		return {
			ngModule: MenuModule,
			providers: [
				{
					provide: MENU_ITEMS,
					useValue: menuItems,
					multi: true
				},
				{
					provide: ANALYZE_FOR_ENTRY_COMPONENTS,
					useValue: menuItems,
					multi: true
				}
			]
		};
	}

	constructor(protected store: Store<any>, @Inject(MENU_ITEMS) menuItemsMulti: IMenuItem[][],
				@Inject(MenuConfig) public menuConfig: IMenuConfig) {

		let menuItems = menuItemsMulti.reduce((prev, next) => [...prev, ...next], []);

		// if empty put all
		if (Array.isArray(menuConfig.menuItems)) {
			menuItems = menuItems.filter((menuItem: IMenuItem) => {
				return menuConfig.menuItems.includes(menuItem.name);
			});
		}

		store.dispatch(new InitializeMenuItemsAction(menuItems));
	}
}
