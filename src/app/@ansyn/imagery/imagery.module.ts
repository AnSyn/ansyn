import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryComponent } from './imagery/imagery.component';
import { ImageryCommunicatorService } from './communicator-service/communicator.service';
import { IImageryConfig, initialImageryConfig } from './model/iimagery-config';
import { CacheService } from './cache-service/cache.service';
import { createImageryMapsCollection, ImageryMapsProvider } from './providers/imagery-map-collection';
import { MapComponent } from './map/map.component';
import { IBaseImageryMapConstructor } from './model/base-imagery-map';
import { BaseMapSourceProviderProvider, createMapSourceProviders } from './providers/map-source-providers';
import { createConfig } from './providers/config';
import { createPluginsCollection } from './providers/plugins-collection';
import { IBaseImageryPluginConstructor } from './model/base-imagery-plugin';
import { IBaseMapSourceProviderConstructor } from './model/base-map-source-provider';
import { HttpClientModule } from '@angular/common/http';

export interface ImageryMetaData {
	maps: IBaseImageryMapConstructor[],
	plugins: IBaseImageryPluginConstructor[],
	mapSourceProviders: IBaseMapSourceProviderConstructor[]
}

// @dynamic
@NgModule({
	imports: [
		CommonModule,
		HttpClientModule
	],
	declarations: [ImageryComponent, MapComponent],
	entryComponents: [MapComponent],
	providers: [
		ImageryCommunicatorService,
		CacheService,
		createConfig(initialImageryConfig),
		createPluginsCollection([]),
		createImageryMapsCollection([]),
		createMapSourceProviders([]),
		BaseMapSourceProviderProvider,
		ImageryMapsProvider
	],
	exports: [ImageryComponent]
})
export class ImageryModule {

	static provide(metadata: ImageryMetaData): ModuleWithProviders {
		return {
			ngModule: ImageryModule,
			providers: [
				createImageryMapsCollection(metadata.maps),
				createPluginsCollection(metadata.plugins),
				createMapSourceProviders(metadata.mapSourceProviders)
			]
		};
	}

	static provideConfig(config: IImageryConfig): ModuleWithProviders {
		return {
			ngModule: ImageryModule,
			providers: [createConfig(config)]
		};
	}

}
