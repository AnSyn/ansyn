import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ImageryModule } from '@ansyn/imagery/imagery.module';
import { OpenLayerNotGeoRegisteredPlanetSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-not-geo-registered-planet-source-provider';
import { OpenLayerBingSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-BING-source-provider';
import { OpenLayerESRI4326SourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-ESRI-4326-source-provider';
import { OpenLayerOpenAerialSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-open-aerial-source-provider';

@NgModule({
	imports: [
		HttpClientModule,
		ImageryModule.provideMapSourceProviders([
			OpenLayerNotGeoRegisteredPlanetSourceProvider,
			OpenLayerBingSourceProvider,
			OpenLayerESRI4326SourceProvider,
			OpenLayerOpenAerialSourceProvider
		])
	]
})
export class SomeModule {

}
