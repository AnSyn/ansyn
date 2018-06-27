import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryComponent } from './imagery/imagery.component';
import { ImageryCommunicatorService } from './communicator-service/communicator.service';
import { IImageryConfig, initialImageryConfig } from './model/iimagery-config';
import { CacheService } from './cache-service/cache.service';
import { createImageryMapsCollection } from './providers/imagery-map-collection';
import { MapComponent } from './map/map.component';
import { IMapConstructor } from './model/imap';
import { BaseMapSourceProviderProvider, createMapSourceProviders } from './providers/map-source-providers';
import { createConfig } from './providers/config';
import { createPluginsCollection } from './providers/plugins-collection';
import { BaseImageryPluginConstructor } from './model/base-imagery-plugin';
import { BaseMapSourceProviderConstructor } from './model/base-map-source-provider';

export interface ImageryMetaData {
	maps: IMapConstructor[],
	plugins: BaseImageryPluginConstructor[],
	sourcesProviders: BaseMapSourceProviderConstructor[]
}

@NgModule({
	imports: [CommonModule],
	declarations: [ImageryComponent, MapComponent],
	entryComponents: [MapComponent],
	providers: [
		ImageryCommunicatorService,
		CacheService,
		createConfig(initialImageryConfig),
		createPluginsCollection([]),
		createImageryMapsCollection([]),
		createMapSourceProviders([]),
		BaseMapSourceProviderProvider
	],
	exports: [ImageryComponent]
})
export class ImageryModule {

	static provide(metadata: ImageryMetaData) {
		return {
			ngModule: ImageryModule,
			providers: [
				createImageryMapsCollection(metadata.maps),
				createPluginsCollection(metadata.plugins),
				createMapSourceProviders(metadata.sourcesProviders)
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
