import { MapIteratorPipe } from './pipes/map-iterator.pipe';
import { EffectsModule } from '@ngrx/effects';
import { filtersConfig, FiltersService } from './services/filters.service';
import { IFiltersConfig } from './models/filters-config';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiltersCollectionComponent } from './components/filters-collection/filters-collection.component';
import { CoreModule } from '@ansyn/core';
import { FilterContainerComponent } from './components/filter-container/filter-container.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EnumFilterContainerComponent } from './components/enum-filter-container/enum-filter-container.component';
import { SortPipe } from './pipes/sort.pipe';
import { FiltersEffects } from './effects/filters.effects';

@NgModule({
	imports: [
		CommonModule,
		CoreModule,
		BrowserAnimationsModule,
		EffectsModule.run(FiltersEffects)
	],
	declarations: [
		FiltersCollectionComponent,
		FilterContainerComponent,
		MapIteratorPipe,
		EnumFilterContainerComponent,
		SortPipe],
	entryComponents: [FiltersCollectionComponent],
	providers: [FiltersService]
})
export class FiltersModule {

	static forRoot(config: IFiltersConfig): ModuleWithProviders {
		return {
			ngModule: FiltersModule,
			providers: [
				FiltersService,
				{ provide: filtersConfig, useValue: config }
			]
		};
	}

}
