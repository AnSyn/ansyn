import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SandboxComponent } from './components/sandbox.component';
import { MenuModule } from '@ansyn/menu';
import { AnsynPluginsModule, AreaToCredentialsService } from '@ansyn/ansyn';

@NgModule({
	imports: [
		CommonModule,
		AnsynPluginsModule,
		MenuModule.provideMenuItems([
			{
				name: 'Sandbox',
				component: SandboxComponent,
				iconClass: 'icon-main-settings'
			},
		])
	],
	providers: [AreaToCredentialsService],
	exports: [SandboxComponent],
	entryComponents: [SandboxComponent],
	declarations: [SandboxComponent]
})
export class SandboxModule {
}
