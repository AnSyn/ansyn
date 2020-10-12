import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { OpenAerialSourceProvider } from './overlay-source-providers/open-aerial-source-provider';
import { PlanetSourceProvider } from './overlay-source-providers/planet/planet-source-provider';
import { IdahoSourceProvider } from './overlay-source-providers/idaho-source-provider';
import { BooleanFilterMetadata } from '../modules/filters/models/metadata/boolean-filter-metadata';
import { EnumFilterMetadata } from '../modules/filters/models/metadata/enum-filter-metadata';
import { FilterMetadata } from '../modules/filters/models/metadata/filter-metadata.interface';
import { SliderFilterMetadata } from '../modules/filters/models/metadata/slider-filter-metadata';
import { OverlaysModule } from '../modules/overlays/overlays.module';
import { ArrayFilterMetadata } from '../modules/filters/models/metadata/array-filter-metadata';
import { AirbusSourceProvider } from './overlay-source-providers/airbus/airbus-source-provider';
import { ImageryVideoOverlaySourceProvider } from './overlay-source-providers/video/imagery-video-overlay-source-provider';
import { ImageryVideoModule } from '@ansyn/imagery-video';
import { Pic4cartoSourceProvider } from './overlay-source-providers/pic4carto/pic4carto-source-provider';
import { FilterCounters } from '../modules/filters/models/counters/filter-counters.interface';
import { EnumFilterCounters } from '../modules/filters/models/counters/enum-filter-counters';
import { SliderFilterCounters } from '../modules/filters/models/counters/slider-filter-counters';
import { BooleanFilterCounters } from '../modules/filters/models/counters/boolean-filter-counters';
import { ArrayFilterCounters } from '../modules/filters/models/counters/array-filter-counters';

@NgModule({
	providers: [
		// Source provider for filters
		{ provide: FilterMetadata, useClass: EnumFilterMetadata, multi: true },
		{ provide: FilterMetadata, useClass: SliderFilterMetadata, multi: true },
		{ provide: FilterMetadata, useClass: BooleanFilterMetadata, multi: true },
		{ provide: FilterMetadata, useClass: ArrayFilterMetadata, multi: true },
		{ provide: FilterCounters, useClass: EnumFilterCounters, multi: true },
		{ provide: FilterCounters, useClass: SliderFilterCounters, multi: true },
		{ provide: FilterCounters, useClass: BooleanFilterCounters, multi: true },
		{ provide: FilterCounters, useClass: ArrayFilterCounters, multi: true }
	],
	imports: [
		HttpClientModule,
		ImageryVideoModule,
		OverlaysModule.provide({
			overlaySourceProviders: [
				ImageryVideoOverlaySourceProvider,
				PlanetSourceProvider,
				OpenAerialSourceProvider,
				IdahoSourceProvider,
				AirbusSourceProvider,
				Pic4cartoSourceProvider
			]
		})
	]
})
export class AppProvidersModule {

}
