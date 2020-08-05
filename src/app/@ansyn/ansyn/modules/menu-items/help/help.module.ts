import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HelpComponent } from './components/help.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { CommonModule } from '@angular/common';
import { HelpLocalStorageService } from './services/help.local-storage.service';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '../../core/core.module';
import { IMenuConfig, IMenuState, MenuConfig, SelectMenuItemAction } from '@ansyn/menu';
import { Store } from '@ngrx/store';

@NgModule({
	imports: [
		CoreModule,
		CommonModule,
		FormsModule,
		CarouselModule.forRoot()
	],
	providers: [
		HelpLocalStorageService,
		{
			provide: APP_INITIALIZER,
			useFactory: helpAppInitializeFactory,
			deps: [Store, MenuConfig, HelpLocalStorageService],
			multi: true

		}
		],
	declarations: [HelpComponent],
})
export class HelpModule {
}

export function helpAppInitializeFactory(store: Store<IMenuState>, menuConfig: IMenuConfig, helpStorage: HelpLocalStorageService) {
	return function () {
		const { menuItems } = menuConfig;
		const { dontShowHelpOnStartup } = helpStorage.getHelpLocalStorageData();
		if ( (!Boolean(menuItems) || menuItems.includes('Help')) && !dontShowHelpOnStartup) {
			store.dispatch(new SelectMenuItemAction({ menuKey: 'Help' }));
		}
	};
}
