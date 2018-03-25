import { BaseOverlaySourceProvider } from '@ansyn/overlays';
import {
	IdahoSourceProvider2,
	MultipleOverlaysSource,
	MultipleOverlaysSourceProvider,
	IdahoSourceProvider,
	OpenAerialSourceProvider,
} from './overlay-source-providers';
import {
	OpenLayerBingSourceProvider,
	OpenLayerIDAHOSourceProvider,
	OpenLayerIDAHO2SourceProvider,
	OpenLayerOpenAerialSourceProvider,
	OpenLayerOSMSourceProvider,
	OpenLayerTileWMSSourceProvider,
	OpenLayerMapBoxSourceProvider,
	OpenLayerESRI4326SourceProvider
} from './map-source-providers';
import { NgModule } from '@angular/core';
import { BaseMapSourceProvider } from '@ansyn/imagery';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FilterMetadata } from '@ansyn/menu-items/filters/models/metadata/filter-metadata.interface';
import { EnumFilterMetadata, SliderFilterMetadata } from '@ansyn/menu-items/filters';
import { BooleanFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/boolean-filter-metadata';
import { OpenLayersProjectionService } from '@ansyn/plugins/openlayers/open-layers-map';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';

@NgModule({
	imports: [
		BrowserModule,
		HttpClientModule
	],
	providers: [
		// Source provider for overlays
		{ provide: BaseOverlaySourceProvider, useClass: MultipleOverlaysSourceProvider },

		{ provide: MultipleOverlaysSource, useClass: IdahoSourceProvider, multi: true },
		{ provide: MultipleOverlaysSource, useClass: IdahoSourceProvider2, multi: true },
		{ provide: MultipleOverlaysSource, useClass: OpenAerialSourceProvider, multi: true },

		// Map tiling source services
		{ provide: BaseMapSourceProvider, useClass: OpenLayerTileWMSSourceProvider, multi: true },
		{ provide: BaseMapSourceProvider, useClass: OpenLayerMapBoxSourceProvider, multi: true },
		{ provide: BaseMapSourceProvider, useClass: OpenLayerOSMSourceProvider, multi: true },
		{ provide: BaseMapSourceProvider, useClass: OpenLayerIDAHOSourceProvider, multi: true },
		{ provide: BaseMapSourceProvider, useClass: OpenLayerIDAHO2SourceProvider, multi: true },
		{ provide: BaseMapSourceProvider, useClass: OpenLayerOpenAerialSourceProvider, multi: true },
		{ provide: BaseMapSourceProvider, useClass: OpenLayerBingSourceProvider, multi: true },
		{ provide: BaseMapSourceProvider, useClass: OpenLayerESRI4326SourceProvider, multi: true },

		// Source provider for filters
		{ provide: FilterMetadata, useClass: EnumFilterMetadata, multi: true },
		{ provide: FilterMetadata, useClass: SliderFilterMetadata, multi: true },
		{ provide: FilterMetadata, useClass: BooleanFilterMetadata, multi: true },

		{ provide: ProjectionService, useClass: OpenLayersProjectionService }
	]
})
export class AppProvidersModule {

}
