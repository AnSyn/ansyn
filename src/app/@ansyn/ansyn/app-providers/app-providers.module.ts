import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { OpenAerialSourceProvider } from './overlay-source-providers/open-aerial-source-provider';
import { PlanetSourceProvider } from './overlay-source-providers/planet/planet-source-provider';
import { IdahoSourceProvider } from './overlay-source-providers/idaho-source-provider';
import { BooleanFilterMetadata } from '../modules/menu-items/filters/models/metadata/boolean-filter-metadata';
import { EnumFilterMetadata } from '../modules/menu-items/filters/models/metadata/enum-filter-metadata';
import { FilterMetadata } from '../modules/menu-items/filters/models/metadata/filter-metadata.interface';
import { SliderFilterMetadata } from '../modules/menu-items/filters/models/metadata/slider-filter-metadata';
import { OverlaysModule } from '../modules/overlays/overlays.module';
import { ArrayFilterMetadata } from '../modules/menu-items/filters/models/metadata/array-filter-metadata';
import { AirbusSourceProvider } from './overlay-source-providers/airbus/airbus-source-provider';
import { ImageryVideoOverlaySourceProvider } from './overlay-source-providers/video/imagery-video-overlay-source-provider';
import { ImageryVideoModule } from '@ansyn/imagery-video';
import { Pic4cartoSourceProvider } from './overlay-source-providers/pic4carto-source-provider';

@NgModule({
	providers: [
		// Source provider for filters
		{ provide: FilterMetadata, useClass: EnumFilterMetadata, multi: true },
		{ provide: FilterMetadata, useClass: SliderFilterMetadata, multi: true },
		{ provide: FilterMetadata, useClass: BooleanFilterMetadata, multi: true },
		{ provide: FilterMetadata, useClass: ArrayFilterMetadata, multi: true }
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
