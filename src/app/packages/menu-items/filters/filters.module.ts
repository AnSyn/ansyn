import { ObjectIteratorPipe } from './pipes/object-iterator.pipe';
import { MapIteratorPipe } from './pipes/map-iterator.pipe';
import { EffectsModule } from '@ngrx/effects';
import { filtersConfig } from './services/filters.service';
import { FiltersConfig } from './models/filters-config';
import { NgModule, ModuleWithProviders, InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiltersCollectionComponent } from "./components/filters-collection/filters-collection.component";
import { CoreModule, AddMenuItemAction, MenuItem } from "@ansyn/core";
import { Store } from '@ngrx/store';
import { FiltersService } from './services/filters.service';
import { FilterContainerComponent } from './components/filter-container/filter-container.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
	imports: [
		CommonModule,
		CoreModule,
		BrowserAnimationsModule],
	declarations: [FiltersCollectionComponent, FilterContainerComponent, MapIteratorPipe, ObjectIteratorPipe],
	entryComponents: [FiltersCollectionComponent],
	providers: [FiltersService]
})
export class FiltersModule {

	static forRoot(config: FiltersConfig): ModuleWithProviders {
		return {
			ngModule: FiltersModule,
			providers: [
				FiltersService,
				{ provide: filtersConfig, useValue: config }
			]
		};
	}

	constructor(store: Store<any>) {
		let menu_item: MenuItem = {
			name: "Filters",
			component: FiltersCollectionComponent,
			icon_url: "/assets/icons/filters.svg"
		};
		store.dispatch(new AddMenuItemAction(menu_item));
	}
}
