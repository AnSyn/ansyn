import { MapIteratorPipe } from './pipes/map-iterator.pipe';
import { EffectsModule } from '@ngrx/effects';
import { filtersConfig } from './services/filters.service';
import { IFiltersConfig } from './models/filters-config';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FiltersCollectionComponent } from './components/filters-collection/filters-collection.component';
import { FilterContainerComponent } from './components/filter-container/filter-container.component';
import { EnumFilterContainerComponent } from './components/enum-filter-container/enum-filter-container.component';
import { SortPipe } from './pipes/sort.pipe';
import { FiltersEffects } from './effects/filters.effects';
import { StoreModule } from '@ngrx/store';
import { filtersFeatureKey, FiltersReducer } from './reducer/filters.reducer';
import { FormsModule } from '@angular/forms';
import { SliderFilterContainerComponent } from './components/slider-filter-container/slider-filter-container.component';
import { BooleanFilterContainerComponent } from './components/boolean-filter-container/boolean-filter-container.component';
import { ShowMorePipe } from './pipes/show-more.pipe';
import { FilterCounterComponent } from './components/filter-counter/filter-counter.component';
import { MapFacadeModule } from '@ansyn/map-facade';
import { CoreModule } from '../core/core.module';
import { ArrayFilterContainerComponent } from './components/array-filter-container/array-filter-container.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';

// @dynamic
@NgModule({
	imports: [
		CommonModule,
		CoreModule,
		StoreModule.forFeature(filtersFeatureKey, FiltersReducer),
		FormsModule,
		MapFacadeModule,
		EffectsModule.forFeature([FiltersEffects]),
		NgxSliderModule
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
	exports: [
		FilterContainerComponent
	]
})
export class FiltersModule {

	static forRoot(config: IFiltersConfig): ModuleWithProviders<FiltersModule> {
		return {
			ngModule: FiltersModule,
			providers: [
				{ provide: filtersConfig, useValue: config }
			]
		};
	}

}
