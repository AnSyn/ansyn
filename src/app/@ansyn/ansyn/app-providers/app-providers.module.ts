import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BooleanFilterMetadata, EnumFilterMetadata, FilterMetadata, SliderFilterMetadata } from '@ansyn/menu-items';
import { ImageryModule, ProjectionService } from '@ansyn/imagery';
import { BaseOverlaySourceProvider } from '@ansyn/overlays';
import { OpenLayersProjectionService } from '@ansyn/plugins';
import { OpenLayerTileWMSSourceProvider } from './map-source-providers/open-layers-TileWMS-source-provider';
import { OpenLayerMapBoxSourceProvider } from './map-source-providers/open-layers-MapBox-source-provider';
import { OpenLayerNotGeoRegisteredPlanetSourceProvider } from './map-source-providers/open-layers-not-geo-registered-planet-source-provider';
import { OpenLayerBingSourceProvider } from './map-source-providers/open-layers-BING-source-provider';
import { OpenLayerOSMSourceProvider } from './map-source-providers/open-layers-OSM-source-provider';
import { OpenLayerPlanetSourceProvider } from './map-source-providers/open-layers-planet-source-provider';
import { OpenLayerIDAHOSourceProvider } from './map-source-providers/open-layers-IDAHO-source-provider';
import { OpenLayerESRI4326SourceProvider } from './map-source-providers/open-layers-ESRI-4326-source-provider';
import { OpenLayerOpenAerialSourceProvider } from './map-source-providers/open-layers-open-aerial-source-provider';
import {
	MultipleOverlaysSource,
	MultipleOverlaysSourceProvider
} from '../../overlays/services/multiple-source-provider';
import { OpenAerialSourceProvider } from './overlay-source-providers/open-aerial-source-provider';
import { PlanetSourceProvider } from './overlay-source-providers/planet/planet-source-provider';
import { IdahoSourceProvider } from './overlay-source-providers/idaho-source-provider';
import { ImisightSourceProvider } from './overlay-source-providers/imisight/imisight-source-provider';
import { OpenLayersImisightSourceProvider } from './map-source-providers/open-layers-imisight-source-provider';

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
				OpenLayerNotGeoRegisteredPlanetSourceProvider,
				OpenLayerBingSourceProvider,
				OpenLayerESRI4326SourceProvider,
				OpenLayerOpenAerialSourceProvider,
				OpenLayersImisightSourceProvider
			],
			plugins: [],
			maps: []
		})
	],
	providers: [
		{ provide: MultipleOverlaysSource, useClass: PlanetSourceProvider, multi: true },
		{ provide: MultipleOverlaysSource, useClass: OpenAerialSourceProvider, multi: true },
		{ provide: MultipleOverlaysSource, useClass: IdahoSourceProvider, multi: true },
		{ provide: MultipleOverlaysSource, useClass: ImisightSourceProvider, multi: true },

		// Source provider for filters
		{ provide: FilterMetadata, useClass: EnumFilterMetadata, multi: true },
		{ provide: FilterMetadata, useClass: SliderFilterMetadata, multi: true },
		{ provide: FilterMetadata, useClass: BooleanFilterMetadata, multi: true },

		{ provide: ProjectionService, useClass: OpenLayersProjectionService }
	]
})
export class AppProvidersModule {

}
