import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolsComponent } from './tools/tools.component';
import { CoreModule, AddMenuItemAction, MenuItem } from "@ansyn/core";
import { Store } from '@ngrx/store';
import { GoToModule } from './go-to/go-to.module';
import { IToolsConfig, toolsConfig } from './models';
import { OverlaysDisplayModeComponent } from './overlays-display-mode/overlays-display-mode.component';
import { AnnotationsControlComponent } from './components/annotations-control/annotations-control.component';



@NgModule({
	imports: [CommonModule, CoreModule, GoToModule],
	declarations: [ToolsComponent, OverlaysDisplayModeComponent, AnnotationsControlComponent],
	entryComponents: [ToolsComponent],
})
export class ToolsModule {


	static forRoot(config: IToolsConfig): ModuleWithProviders {
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
