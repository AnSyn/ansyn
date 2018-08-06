import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FilterMetadata } from '@ansyn/menu-items/filters/models/metadata/filter-metadata.interface';
import { BooleanFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/boolean-filter-metadata';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { BaseOverlaySourceProvider } from '@ansyn/overlays/models/base-overlay-source-provider.model';
import {
	MultipleOverlaysSource,
	MultipleOverlaysSourceProvider
} from '@ansyn/ansyn/app-providers/overlay-source-providers/multiple-source-provider';
import { OpenLayerTileWMSSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-TileWMS-source-provider';
import { OpenLayerMapBoxSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-MapBox-source-provider';
import { OpenLayerOSMSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-OSM-source-provider';
import { OpenLayerIDAHOSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-IDAHO-source-provider';
import { OpenLayerPlanetSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-planet-source-provider';
import { OpenLayerNotGeoRegisteredPlanetSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-not-geo-registered-planet-source-provider';
import { OpenLayerBingSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-BING-source-provider';
import { OpenLayerESRI4326SourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-ESRI-4326-source-provider';
import { EnumFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/enum-filter-metadata';
import { SliderFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/slider-filter-metadata';
import { OpenLayersProjectionService } from '@ansyn/plugins/openlayers/open-layers-map/projection/open-layers-projection.service';
import { OpenLayerOpenAerialSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-open-aerial-source-provider';
import { ImageryModule } from '@ansyn/imagery/imagery.module';
import { ImisightSourceProvider } from '@ansyn/ansyn/app-providers/imisight/overlays-source-providers/imisight-source-provider';
import { ImisightModule } from '@ansyn/ansyn/app-providers/imisight/imisight.module';

@NgModule({
	imports: [
		HttpClientModule,
		ImisightModule,
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

		// { provide: MultipleOverlaysSource, useClass: PlanetSourceProvider, multi: true },
		// { provide: MultipleOverlaysSource, useClass: NotGeoRegisteredPlaneSourceProvider, multi: true },
		// { provide: MultipleOverlaysSource, useClass: OpenAerialSourceProvider, multi: true },
		// { provide: MultipleOverlaysSource, useClass: IdahoSourceProvider, multi: true },
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
