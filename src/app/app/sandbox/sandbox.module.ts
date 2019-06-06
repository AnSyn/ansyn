import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapFacadeModule } from '@ansyn/map-facade';
import { SandboxComponent } from './components/sandbox.component';
import { MenuModule } from '@ansyn/menu';
import { AnsynPluginsModule } from '@ansyn/ansyn';

@NgModule({
	imports: [
		CommonModule,
		AnsynPluginsModule,
		MapFacadeModule,
		MenuModule.provideMenuItems([
			{
				name: 'Sandbox',
				component: SandboxComponent,
				iconClass: 'icon-main-settings'
			},
		])
	],
	exports: [SandboxComponent],
	entryComponents: [SandboxComponent],
	declarations: [SandboxComponent]
})
export class SandboxModule {
}
