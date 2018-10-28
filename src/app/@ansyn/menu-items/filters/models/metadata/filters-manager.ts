import { inject, InjectionToken } from '@angular/core';
import { EnumFilterMetadata } from './enum-filter-metadata';
import { SliderFilterMetadata } from './slider-filter-metadata';
import { BooleanFilterMetadata } from './boolean-filter-metadata';

export interface IFiltersProviders {
	Enum: EnumFilterMetadata;
	Slider: SliderFilterMetadata;
	Boolean: BooleanFilterMetadata;
}

export const FILTERS_PROVIDERS = new InjectionToken<IFiltersProviders>('FILTERS_PROVIDERS', {
	providedIn: 'root',
	factory: (): IFiltersProviders => ({
		Enum: inject(EnumFilterMetadata),
		Slider: inject(SliderFilterMetadata),
		Boolean: inject(BooleanFilterMetadata)
	})
});
