import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolsComponent } from './tools/tools.component';
import { CoreModule, AddMenuItemAction, MenuItem } from "@ansyn/core";
import { Store } from '@ngrx/store';

@NgModule({
	imports: [CommonModule, CoreModule],
	declarations: [ToolsComponent],
	entryComponents: [ToolsComponent],
})
export class ToolsModule {
	constructor(store: Store <any>) {
		let menu_item: MenuItem = {
			name:"Tools",
			component: ToolsComponent,
			icon_url: "/assets/icons/tools.svg"
		};
		store.dispatch(new AddMenuItemAction(menu_item));
	}
}
