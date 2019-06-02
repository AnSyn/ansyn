import { AnsynTranslationModule } from '@ansyn/translation';
import { MapIteratorPipe } from './pipes/map-iterator.pipe';
import { EffectsModule } from '@ngrx/effects';
import { filtersConfig } from './services/filters.service';
import { IFiltersConfig } from './models/filters-config';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiltersCollectionComponent } from './components/filters-collection/filters-collection.component';
import { FilterContainerComponent } from './components/filter-container/filter-container.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EnumFilterContainerComponent } from './components/enum-filter-container/enum-filter-container.component';
import { SortPipe } from './pipes/sort.pipe';
import { FiltersEffects } from './effects/filters.effects';
import { StoreModule } from '@ngrx/store';
import { filtersFeatureKey, FiltersReducer } from './reducer/filters.reducer';
import { SliderModule } from 'primeng/primeng';
import { FormsModule } from '@angular/forms';
import { SliderFilterContainerComponent } from './components/slider-filter-container/slider-filter-container.component';
import { BooleanFilterContainerComponent } from './components/boolean-filter-container/boolean-filter-container.component';
import { ShowMorePipe } from './pipes/show-more.pipe';
import { FilterCounterComponent } from './components/filter-counter/filter-counter.component';
import { MapFacadeModule } from '@ansyn/map-facade';
import { CoreModule } from '../../core/core.module';
import { ArrayFilterContainerComponent } from './components/array-filter-container/array-filter-container.component';

// @dynamic
@NgModule({
	imports: [
		CommonModule,
		CoreModule,
		BrowserAnimationsModule,
		StoreModule.forFeature(filtersFeatureKey, FiltersReducer),
		SliderModule,
		FormsModule,
		MapFacadeModule,
		EffectsModule.forFeature([FiltersEffects]),
		AnsynTranslationModule
	],
	declarations: [
		FiltersCollectionComponent,
		FilterContainerComponent,
		MapIteratorPipe,
		EnumFilterContainerComponent,
		SliderFilterContainerComponent,
		SortPipe,
		BooleanFilterContainerComponent,
		ShowMorePipe,
		FilterCounterComponent,
		ArrayFilterContainerComponent
	],
	entryComponents: [FiltersCollectionComponent]
})
export class FiltersModule {

	static forRoot(config: IFiltersConfig): ModuleWithProviders {
		return {
			ngModule: FiltersModule,
			providers: [
				{ provide: filtersConfig, useValue: config }
			]
		};
	}

}
