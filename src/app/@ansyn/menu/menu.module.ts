import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu/menu.component';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { menuFeatureKey, MenuReducer } from './reducers/menu.reducer';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MENU_ITEMS } from './helpers/menu-item-token';


// @dynamic
@NgModule({
	imports: [
		CommonModule,
		StoreModule.forFeature(menuFeatureKey, MenuReducer),
		TranslateModule,
		MatProgressSpinnerModule
	],
	declarations: [MenuComponent],
	exports: [MenuComponent]
})
export class MenuModule {

	static provideMenuItems(menuItems: any[]): ModuleWithProviders<MenuModule> {
		return {
			ngModule: MenuModule,
			providers: [
				{
					provide: MENU_ITEMS,
					useValue: menuItems,
					multi: true
				}
			]
		};
	}
}
