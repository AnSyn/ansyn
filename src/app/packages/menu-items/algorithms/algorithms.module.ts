import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmsComponent } from './algorithms/algorithms.component';
import { AddMenuItemAction } from '@ansyn/menu';
import { CoreModule, MenuItem } from '@ansyn/core';
import { Store } from '@ngrx/store';

@NgModule({
	imports: [CoreModule, CommonModule],
	declarations: [AlgorithmsComponent],
	entryComponents: [AlgorithmsComponent],
	exports: [AlgorithmsComponent]
})
export class AlgorithmsModule {
	constructor(store: Store<any>) {
		let menu_item: MenuItem = {
			name: 'Algorithms',
			component: AlgorithmsComponent,
			icon_url: '/assets/icons/algorithms.svg'
		};
		store.dispatch(new AddMenuItemAction(menu_item));
	}
}
