import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu/menu.component';
import { CoreModule } from '@ansyn/core';
import { EffectsModule } from '@ngrx/effects';
import { MenuEffects } from './effects/menu.effects';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MenuItem } from './models/menu-item.model';
import { Store } from '@ngrx/store';
import { InitializeMenuItemsAction } from './actions/menu.actions';

@NgModule({
	imports: [CommonModule, CoreModule, EffectsModule.run(MenuEffects), BrowserAnimationsModule],
	declarations: [MenuComponent],
	exports: [MenuComponent]
})
export class MenuModule {

	static provideMenuItem({menuItems}: {menuItems: MenuItem[]}): ModuleWithProviders {
		return {
			ngModule: MenuModule,
			providers: [
				{
					provide: APP_INITIALIZER,
					useFactory(store: Store<any>) {
						return function () {
							console.log("store ", store);
							console.log("menuItems ", menuItems);

							// store.dispatch(new InitializeMenuItemsAction(menuItems));
							// ansynRouterService.onNavigationEnd().subscribe();
						};
					},
					deps: [Store],
					multi: true
				},
			]
		};
	}
}

// export function useFactoryInitializer(store: Store<any>) {
// 	return function () {
// 		store.dispatch(new InitializeMenuItemsAction())
// 		ansynRouterService.onNavigationEnd().subscribe();
// 	};
// }
