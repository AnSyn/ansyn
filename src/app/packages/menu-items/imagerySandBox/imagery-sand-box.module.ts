/**
 * Created by AsafMas on 10/05/2017.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagerySandBoxComponent } from './component/imagery-sand-box.component';
import { CoreModule, AddMenuItemAction, MenuItem } from '@ansyn/core';
import { Store } from '@ngrx/store';

@NgModule({
	imports: [CommonModule, CoreModule],
	declarations: [ImagerySandBoxComponent],
	entryComponents: [ImagerySandBoxComponent]
})
export class ImagerySandBoxModule {
	constructor(store: Store <any>) {
		const menu_item: MenuItem = {
			name: 'ImagerySandBox',
			component: ImagerySandBoxComponent,
			icon_url: '/assets/icons/tools.svg'
		};
		store.dispatch(new AddMenuItemAction(menu_item));
	}
}
