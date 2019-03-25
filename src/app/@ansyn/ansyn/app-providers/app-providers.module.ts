import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BooleanFilterMetadata, EnumFilterMetadata, FilterMetadata, SliderFilterMetadata } from '../modules/menu-items/public_api';
import { OverlaysModule } from '../modules/overlays/public_api';
import { OpenAerialSourceProvider } from './overlay-source-providers/open-aerial-source-provider';
import { PlanetSourceProvider } from './overlay-source-providers/planet/planet-source-provider';
import { IdahoSourceProvider } from './overlay-source-providers/idaho-source-provider';

@NgModule({
	imports: [
		HttpClientModule,
		OverlaysModule.provide({
			overlaySourceProviders: [
				PlanetSourceProvider,
				OpenAerialSourceProvider,
				IdahoSourceProvider
			]
		})
	],
	providers: [
		// Source provider for filters
		{ provide: FilterMetadata, useClass: EnumFilterMetadata, multi: true },
		{ provide: FilterMetadata, useClass: SliderFilterMetadata, multi: true },
		{ provide: FilterMetadata, useClass: BooleanFilterMetadata, multi: true }
	]
})
export class AppProvidersModule {

}
