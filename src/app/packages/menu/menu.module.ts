import { Inject, InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu/menu.component';
import { CoreModule } from '@ansyn/core';
import { EffectsModule } from '@ngrx/effects';
import { MenuEffects } from './effects/menu.effects';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MenuItem } from './models/menu-item.model';
import { Store, StoreModule } from '@ngrx/store';
import { InitializeMenuItemsAction } from './actions/menu.actions';
import { menuFeatureKey, MenuReducer } from './reducers/menu.reducer';

export const MENU_ITEMS = new InjectionToken<MenuItem[]>('MENU_ITEMS');

@NgModule({
	imports: [
		CommonModule,
		CoreModule,
		StoreModule.forFeature(menuFeatureKey, MenuReducer),
		EffectsModule.forFeature([MenuEffects]),
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
				}
			]
		};
	}

	constructor(private store: Store<any>, @Inject(MENU_ITEMS) menuItems: MenuItem[]) {
		store.dispatch(new InitializeMenuItemsAction(menuItems));
	}
}
