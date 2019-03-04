import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { MenuModule } from '@ansyn/menu';

@NgModule({
	declarations: [ContactUsComponent],
	entryComponents: [ContactUsComponent],
	exports: [ContactUsComponent],
	imports: [
		CommonModule,
		MenuModule.provideMenuItems([{
			name: 'Contact-Us',
			component: ContactUsComponent,
			iconClass: 'fa fa-envelope-open'
		}]),
	]
})
export class ContactUsModule {
}
