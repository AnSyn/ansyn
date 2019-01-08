import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SendboxComponent } from './sendbox/sendbox.component';
import { MenuModule } from '@ansyn/menu';

@NgModule({
	imports: [
		CommonModule,
		MenuModule.provideMenuItems([
			{
				name: 'Sendbox',
				component: SendboxComponent,
				iconClass: 'icon-main-settings'
			},
		])
	],
	exports: [SendboxComponent],
	entryComponents: [SendboxComponent],
	declarations: [SendboxComponent]
})
export class SendboxModule {
}
