import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BooleanFilterMetadata, EnumFilterMetadata, FilterMetadata, SliderFilterMetadata } from '@ansyn/menu-items';
import { ImageryModule, ProjectionService } from '@ansyn/imagery';
import { OpenLayersProjectionService } from '@ansyn/plugins';
import { OpenLayerTileWMSSourceProvider } from './map-source-providers/open-layers-TileWMS-source-provider';
import { OpenLayerMapBoxSourceProvider } from './map-source-providers/open-layers-MapBox-source-provider';
import { OpenLayerBingSourceProvider } from './map-source-providers/open-layers-BING-source-provider';
import { OpenLayerOSMSourceProvider } from './map-source-providers/open-layers-OSM-source-provider';
import { OpenLayerPlanetSourceProvider } from './map-source-providers/open-layers-planet-source-provider';
import { OpenLayerIDAHOSourceProvider } from './map-source-providers/open-layers-IDAHO-source-provider';
import { OpenLayerESRI4326SourceProvider } from './map-source-providers/open-layers-ESRI-4326-source-provider';
import { OpenLayerOpenAerialSourceProvider } from './map-source-providers/open-layers-open-aerial-source-provider';
import { OverlaysModule } from '@ansyn/overlays';
import { OpenAerialSourceProvider } from './overlay-source-providers/open-aerial-source-provider';
import { PlanetSourceProvider } from './overlay-source-providers/planet/planet-source-provider';
import { IdahoSourceProvider } from './overlay-source-providers/idaho-source-provider';

@NgModule({
	imports: [
		HttpClientModule,
		ImageryModule.provide({
			mapSourceProviders: [
				OpenLayerTileWMSSourceProvider,
				OpenLayerMapBoxSourceProvider,
				OpenLayerOSMSourceProvider,
				OpenLayerIDAHOSourceProvider,
				OpenLayerPlanetSourceProvider,
				OpenLayerBingSourceProvider,
				OpenLayerESRI4326SourceProvider,
				OpenLayerOpenAerialSourceProvider
			],
			plugins: [],
			maps: []
		}),
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
		{ provide: FilterMetadata, useClass: BooleanFilterMetadata, multi: true },

		{ provide: ProjectionService, useClass: OpenLayersProjectionService },
	]
})
export class AppProvidersModule {

}
