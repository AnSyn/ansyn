import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FiltersComponent} from "./filters/filters.component";
import {CoreModule, AddMenuItemAction, MenuItem} from "@ansyn/core";
import { Store } from '@ngrx/store';

@NgModule({
	imports: [CommonModule, CoreModule],
	declarations:[FiltersComponent],
	entryComponents:[FiltersComponent]
})
export class FiltersModule {
	constructor(store: Store <any>) {
		let menu_item: MenuItem = {
			name: "Filters",
			component: FiltersComponent,
			icon_url: "/assets/icons/filters.svg"
		};
		store.dispatch(new AddMenuItemAction(menu_item));
	}
}
