/**
 * Created by AsafMas on 10/05/2017.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagerySandBoxComponent } from './component/imagery-sand-box.component';
import { CoreModule, AddMenuItemAction, MenuItem } from '@ansyn/core';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';

@NgModule({
	imports: [CommonModule, CoreModule,FormsModule],
	declarations: [ImagerySandBoxComponent],
	entryComponents: [ImagerySandBoxComponent]
})
export class ImagerySandBoxModule {
	constructor(store: Store <any>) {
		const menu_item: MenuItem = {
			name: 'Imagery SandBox',
			component: ImagerySandBoxComponent,
			icon_url: '/assets/icons/tools.svg'
		};
		store.dispatch(new AddMenuItemAction(menu_item));
	}
}
