import { ANALYZE_FOR_ENTRY_COMPONENTS, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryComponent } from './imagery/imagery.component';
import { ImageryCommunicatorService } from './communicator-service/communicator.service';
import { IImageryConfig, initialImageryConfig } from './model/iimagery-config';
import { ConfigurationToken } from './model/configuration.token';
import { CacheService } from './cache-service/cache.service';
import { createCollection } from './model/plugins-collection';
import { ImageryCollectionEntity } from './model/plugins-collection';
import {
	IMAGERY_MAP_COMPONENTS, IMAGERY_MAP_COMPONENTS_COLLECTION, ImageryMapComponentConstructor,
	ImageryMapComponentFactory
} from './model/imagery-map-component';
import { BaseMapSourceProvider, BaseMapSourceProviderConstructor } from './model/base-map-source-provider';

@NgModule({
	imports: [CommonModule],
	declarations: [ImageryComponent],
	providers: [
		ImageryCommunicatorService,
		{ provide: CacheService, useClass: CacheService, deps: [ConfigurationToken, ImageryCommunicatorService] },
		createCollection([]),
		{
			provide: IMAGERY_MAP_COMPONENTS,
			useFactory: ImageryMapComponentFactory,
			deps: [IMAGERY_MAP_COMPONENTS_COLLECTION]
		}
	],
	exports: [ImageryComponent]
})
export class ImageryModule {

	static forRoot(config?: IImageryConfig): ModuleWithProviders {
		if (!config) {
			config = initialImageryConfig;
		}
		return {
			ngModule: ImageryModule,
			providers: [
				ImageryCommunicatorService,
				{ provide: ConfigurationToken, useValue: config }
			]
		};
	}

	static provideCollection(providers: ImageryCollectionEntity[]): ModuleWithProviders {
		return {
			ngModule: ImageryModule,
			providers: [createCollection(providers)]
		};
	}

	static provideMapComponents(components: ImageryMapComponentConstructor[]): ModuleWithProviders {
		return {
			ngModule: ImageryModule,
			providers: [
				{
					provide: IMAGERY_MAP_COMPONENTS_COLLECTION,
					useValue: components,
					multi: true
				},
				{
					provide: ANALYZE_FOR_ENTRY_COMPONENTS,
					useValue: components,
					multi: true
				}
			]
		};
	}

	static provideMapSourceProviders(mapSourceProviders: BaseMapSourceProviderConstructor): ModuleWithProviders {
		return {
			ngModule: ImageryModule,
			providers: [{ provide: BaseMapSourceProvider, useClass: mapSourceProviders, multi: true }]
		}
	}

}
