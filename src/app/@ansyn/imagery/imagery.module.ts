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
import { GetProvidersMapsService } from './services/get-providers-maps/get-providers-maps.service';
import { COMMUNICATOR_LOG_MESSAGES, communicatorLogMessages } from './communicator-service/communicator-log-messages';
import { TranslateModule } from '@ngx-translate/core';

export interface IImageryMetaData {
	maps: IBaseImageryMapConstructor[],
	plugins: IBaseImageryPluginConstructor[],
	mapSourceProviders: IBaseMapSourceProviderConstructor[]
}

// @dynamic
@NgModule({
	imports: [
		CommonModule,
		HttpClientModule,
		TranslateModule
	],
	declarations: [ImageryComponent, MapComponent],
	providers: [
		ImageryCommunicatorService,
		CacheService,
		createConfig(initialImageryConfig),
		createPluginsCollection([]),
		createImageryMapsCollection([]),
		createMapSourceProviders([]),
		BaseMapSourceProviderProvider,
		ImageryMapsProvider,
		GetProvidersMapsService,
		{
			provide: COMMUNICATOR_LOG_MESSAGES,
			useValue: communicatorLogMessages
		}
	],
	exports: [ImageryComponent]
})
export class ImageryModule {

	static provide(metadata: IImageryMetaData): ModuleWithProviders<ImageryModule> {
		return {
			ngModule: ImageryModule,
			providers: [
				createImageryMapsCollection(metadata.maps),
				createPluginsCollection(metadata.plugins),
				createMapSourceProviders(metadata.mapSourceProviders)
			]
		};
	}

	static provideConfig(config: IImageryConfig): ModuleWithProviders<ImageryModule> {
		return {
			ngModule: ImageryModule,
			providers: [createConfig(config)]
		};
	}

}
