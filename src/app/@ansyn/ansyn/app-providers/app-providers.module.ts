import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BooleanFilterMetadata, EnumFilterMetadata, FilterMetadata, SliderFilterMetadata } from '@ansyn/menu-items';
import { ImageryModule, ProjectionService } from '@ansyn/imagery';
import { OpenLayersProjectionService } from '@ansyn/plugins';
import { OpenLayerTileWMSSourceProvider } from '../../plugins/openlayers/maps/open-layers-TileWMS-source-provider';
import { OpenLayerMapBoxSourceProvider } from '../../plugins/openlayers/maps/open-layers-MapBox-source-provider';
import { OpenLayerBingSourceProvider } from '../../plugins/openlayers/maps/open-layers-BING-source-provider';
import { OpenLayerOSMSourceProvider } from '../../plugins/openlayers/maps/open-layers-OSM-source-provider';
import { OpenLayerPlanetSourceProvider } from '../../plugins/openlayers/maps/open-layers-planet-source-provider';
import { OpenLayerIDAHOSourceProvider } from '../../plugins/openlayers/maps/open-layers-IDAHO-source-provider';
import { OpenLayerESRI4326SourceProvider } from '../../plugins/openlayers/maps/open-layers-ESRI-4326-source-provider';
import { OpenLayerOpenAerialSourceProvider } from '../../plugins/openlayers/maps/open-layers-open-aerial-source-provider';
import { OverlaysModule } from '@ansyn/overlays';
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
		{ provide: FilterMetadata, useClass: BooleanFilterMetadata, multi: true },

		{ provide: ProjectionService, useClass: OpenLayersProjectionService },
	]
})
export class AppProvidersModule {

}
