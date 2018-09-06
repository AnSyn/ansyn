import { InjectionToken, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FilterMetadata } from '@ansyn/menu-items/filters/models/metadata/filter-metadata.interface';
import { BooleanFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/boolean-filter-metadata';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { BaseOverlaySourceProvider } from '@ansyn/overlays/models/base-overlay-source-provider.model';
import { EnumFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/enum-filter-metadata';
import { SliderFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/slider-filter-metadata';
import { OpenLayersProjectionService } from '@ansyn/plugins/openlayers/open-layers-map/projection/open-layers-projection.service';
import { ImageryModule } from '@ansyn/imagery/imagery.module';
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
} from './overlay-source-providers/multiple-source-provider';
import { NotGeoRegisteredPlaneSourceProvider } from './overlay-source-providers/planet/not-geo-registered-planet-source-provider';
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
				OpenLayerNotGeoRegisteredPlanetSourceProvider,
				OpenLayerBingSourceProvider,
				OpenLayerESRI4326SourceProvider,
				OpenLayerOpenAerialSourceProvider
			],
			plugins: [],
			maps: []
		})
	],
	providers: [
		// Source provider for overlays
		{ provide: BaseOverlaySourceProvider, useClass: MultipleOverlaysSourceProvider },

		{ provide: MultipleOverlaysSource, useClass: PlanetSourceProvider, multi: true },
		{ provide: MultipleOverlaysSource, useClass: NotGeoRegisteredPlaneSourceProvider, multi: true },
		{ provide: MultipleOverlaysSource, useClass: OpenAerialSourceProvider, multi: true },
		{ provide: MultipleOverlaysSource, useClass: IdahoSourceProvider, multi: true },

		// Source provider for filters
		{ provide: FilterMetadata, useClass: EnumFilterMetadata, multi: true },
		{ provide: FilterMetadata, useClass: SliderFilterMetadata, multi: true },
		{ provide: FilterMetadata, useClass: BooleanFilterMetadata, multi: true },

		{ provide: ProjectionService, useClass: OpenLayersProjectionService }
	]
})
export class AppProvidersModule {

}
