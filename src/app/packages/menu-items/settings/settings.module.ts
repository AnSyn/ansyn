import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings/settings.component';
import { CoreModule, AddMenuItemAction, MenuItem } from "@ansyn/core";
import { Store } from '@ngrx/store';

@NgModule({
	imports: [CommonModule, CoreModule],
	declarations: [SettingsComponent],
	entryComponents:[SettingsComponent]
})
export class SettingsModule {
	constructor(store: Store <any>) {
		let menu_item: MenuItem = {
			name:"Settings",
			component: SettingsComponent,
			icon_url: "/assets/icons/settings.svg"
		};
		store.dispatch(new AddMenuItemAction(menu_item));
	}
}
