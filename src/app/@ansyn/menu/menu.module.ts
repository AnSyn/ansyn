import { ANALYZE_FOR_ENTRY_COMPONENTS, Inject, InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu/menu.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IMenuItem, MENU_ITEMS_CONFIG } from './models/menu-item.model';
import { Store, StoreModule } from '@ngrx/store';
import { InitializeMenuItemsAction } from './actions/menu.actions';
import { menuFeatureKey, MenuReducer } from './reducers/menu.reducer';

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
					useValue: menuItems
				},
				{
					provide: ANALYZE_FOR_ENTRY_COMPONENTS,
					useValue: menuItems,
					multi: true
				}
			]
		};
	}

	constructor(protected store: Store<any>, @Inject(MENU_ITEMS) menuItems: IMenuItem[],
				@Inject(MENU_ITEMS_CONFIG) public configMenuItems: string[]) {

		// if empty put all
		if (configMenuItems && configMenuItems.length > 0) {
			menuItems = menuItems.filter((menuItem: IMenuItem) => {
				return configMenuItems.includes(menuItem.name);
			});
		}

		store.dispatch(new InitializeMenuItemsAction(menuItems));
	}
}
