import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FilterMetadata } from '@ansyn/menu-items/filters/models/metadata/filter-metadata.interface';
import { BooleanFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/boolean-filter-metadata';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { BaseOverlaySourceProvider } from '@ansyn/overlays/models/base-overlay-source-provider.model';
import {
	IMultipleOverlaysSources, MultipleOverlaysSource,
	MultipleOverlaysSourceProvider
} from '@ansyn/ansyn/app-providers/overlay-source-providers/multiple-source-provider';
import { PlanetSourceProvider } from '@ansyn/ansyn/app-providers/overlay-source-providers/planet/planet-source-provider';
import { NotGeoRegisteredPlaneSourceProvider } from '@ansyn/ansyn/app-providers/overlay-source-providers/planet/not-geo-registered-planet-source-provider';
import { OpenLayerTileWMSSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-TileWMS-source-provider';
import { OpenLayerMapBoxSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-MapBox-source-provider';
import { OpenLayerOSMSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-OSM-source-provider';
import { OpenLayerIDAHOSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-IDAHO-source-provider';
import { OpenLayerIDAHO2SourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-IDAHO2-source-provider';
import { OpenLayerPlanetSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-planet-source-provider';
import { OpenLayerNotGeoRegisteredPlanetSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-not-geo-registered-planet-source-provider';
import { OpenLayerBingSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-BING-source-provider';
import { OpenLayerESRI4326SourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-ESRI-4326-source-provider';
import { EnumFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/enum-filter-metadata';
import { SliderFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/slider-filter-metadata';
import { OpenLayersProjectionService } from '@ansyn/plugins/openlayers/open-layers-map/projection/open-layers-projection.service';
import { BaseMapSourceProvider } from '@ansyn/imagery/model/base-map-source-provider';
import { OpenAerialSourceProvider } from '@ansyn/ansyn/app-providers/overlay-source-providers/open-aerial-source-provider';
import { OpenLayerOpenAerialSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-open-aerial-source-provider';

export const appProviders = [
	// Source provider for overlays
	{ provide: BaseOverlaySourceProvider, useClass: MultipleOverlaysSourceProvider },

	// { provide: MultipleOverlaysSource, useClass: IdahoSourceProvider, multi: true },
	// { provide: MultipleOverlaysSource, useClass: IdahoSourceProvider2, multi: true },
	{ provide: MultipleOverlaysSource, useClass: PlanetSourceProvider, multi: true },
	{
		provide: <InjectionToken<IMultipleOverlaysSources>>MultipleOverlaysSource,
		useClass: NotGeoRegisteredPlaneSourceProvider,
		multi: true
	},
	{ provide: MultipleOverlaysSource, useClass: OpenAerialSourceProvider, multi: true },

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
	{ provide: BaseMapSourceProvider, useClass: OpenLayerOpenAerialSourceProvider, multi: true },

	// Source provider for filters
	{ provide: FilterMetadata, useClass: EnumFilterMetadata, multi: true },
	{ provide: FilterMetadata, useClass: SliderFilterMetadata, multi: true },
	{ provide: FilterMetadata, useClass: BooleanFilterMetadata, multi: true },

	{ provide: ProjectionService, useClass: OpenLayersProjectionService }
];

@NgModule({
	imports: [
		HttpClientModule
	],
	providers: appProviders
})
export class AppProvidersModule {

	static forRoot(providers: Array<{ provide: any, useClass: any, multi: true }>): ModuleWithProviders {
		return {
			ngModule: AppProvidersModule,
			providers: [
				...appProviders,
				...providers
			]
		};
	}
}
