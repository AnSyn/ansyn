import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolsComponent } from './tools/tools.component';
import { CoreModule, AddMenuItemAction, MenuItem } from "@ansyn/core";
import { Store } from '@ngrx/store';
import { GoToModule } from './go-to/go-to.module';
import { ToolsConfig, toolsConfig } from './models/tools-config';



@NgModule({
	imports: [CommonModule, CoreModule, GoToModule],
	declarations: [ToolsComponent],
	entryComponents: [ToolsComponent],
})
export class ToolsModule {


	static forRoot(config: ToolsConfig): ModuleWithProviders {
		return {
			ngModule: ToolsModule,
			providers: [
				{ provide: toolsConfig, useValue: config }
			]
		};
	}



	constructor(store: Store <any>) {
		let menu_item: MenuItem = {
			name:"Tools",
			component: ToolsComponent,
			icon_url: "/assets/icons/tools.svg"
		};
		store.dispatch(new AddMenuItemAction(menu_item));
	}
}
