import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FilterMetadata } from '@ansyn/menu-items/filters/models/metadata/filter-metadata.interface';
import { BooleanFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/boolean-filter-metadata';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import {
	MultipleOverlaysSource,
	MultipleOverlaysSourceProvider
} from '@ansyn/ansyn/app-providers/overlay-source-providers/multiple-source-provider';
import { BaseOverlaySourceProvider } from '@ansyn/overlays/models/base-overlay-source-provider.model';
import { PlanetSourceProvider } from '@ansyn/ansyn/app-providers/overlay-source-providers/planet/planet-source-provider';
import { NotGeoRegisteredPlaneSourceProvider } from '@ansyn/ansyn/app-providers/overlay-source-providers/planet/not-geo-registered-planet-source-provider';
import { BaseMapSourceProvider } from '@ansyn/imagery/model/base-map-source-provider';
import { OpenLayerTileWMSSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-TileWMS-source-provider';
import { OpenLayerMapBoxSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-MapBox-source-provider';
import { OpenLayerOSMSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-OSM-source-provider';
import { OpenLayerIDAHOSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-IDAHO-source-provider';
import { OpenLayerPlanetSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-planet-source-provider';
import { OpenLayerIDAHO2SourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-IDAHO2-source-provider';
import { OpenLayerNotGeoRegisteredPlanetSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-not-geo-registered-planet-source-provider';
import { OpenLayerBingSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-BING-source-provider';
import { OpenLayerESRI4326SourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-ESRI-4326-source-provider';
import { EnumFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/enum-filter-metadata';
import { SliderFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/slider-filter-metadata';
import { OpenLayersProjectionService } from '@ansyn/plugins/openlayers/open-layers-map/projection/open-layers-projection.service';

@NgModule({
	imports: [
		BrowserModule,
		HttpClientModule
	],
	providers: [
		// Source provider for overlays
		{ provide: BaseOverlaySourceProvider, useClass: MultipleOverlaysSourceProvider },

		// { provide: MultipleOverlaysSource, useClass: IdahoSourceProvider, multi: true },
		// { provide: MultipleOverlaysSource, useClass: IdahoSourceProvider2, multi: true },
		{ provide: MultipleOverlaysSource, useClass: PlanetSourceProvider, multi: true },
		{ provide: MultipleOverlaysSource, useClass: NotGeoRegisteredPlaneSourceProvider, multi: true },

		// Map tiling source services
		{ provide: BaseMapSourceProvider, useClass: OpenLayerTileWMSSourceProvider, multi: true },
		{ provide: BaseMapSourceProvider, useClass: OpenLayerMapBoxSourceProvider, multi: true },
		{ provide: BaseMapSourceProvider, useClass: OpenLayerOSMSourceProvider, multi: true },
		{ provide: BaseMapSourceProvider, useClass: OpenLayerIDAHOSourceProvider, multi: true },
		{ provide: BaseMapSourceProvider, useClass: OpenLayerIDAHO2SourceProvider, multi: true },
		{ provide: BaseMapSourceProvider, useClass: OpenLayerPlanetSourceProvider, multi: true },
		{ provide: BaseMapSourceProvider, useClass: OpenLayerNotGeoRegisteredPlanetSourceProvider, multi: true },
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
