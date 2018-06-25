import { ANALYZE_FOR_ENTRY_COMPONENTS, Injector, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryComponent } from './imagery/imagery.component';
import { ImageryCommunicatorService } from './communicator-service/communicator.service';
import { IImageryConfig, initialImageryConfig } from './model/iimagery-config';
import { ConfigurationToken } from './model/configuration.token';
import { CacheService } from './cache-service/cache.service';
import { createCollection, ImageryCollectionEntity } from './providers/plugins-collection';
import {
	IMAGERY_MAP_COMPONENTS,
	IMAGERY_MAP_COMPONENTS_COLLECTION,
	ImageryMapComponentConstructor,
	ImageryMapComponentFactory
} from './model/imagery-map-component';
import {
	BaseMapSourceProvider, BaseMapSourceProviderConstructor,
	IMAGERY_MAP_SOURCE_PROVIDERS
} from './model/base-map-source-provider';
import {
	BaseMapSourceProviderFactory, BaseMapSourceProviderProvider,
	createMapSourceProviders
} from './providers/map-source-providers';
import { createComponentCollection, MapComponentsProvider } from '@ansyn/imagery/providers/map-components';
import { createConfig } from '@ansyn/imagery/providers/config';

@NgModule({
	imports: [CommonModule],
	declarations: [ImageryComponent],
	providers: [
		ImageryCommunicatorService,
		CacheService,
		createCollection([]),
		MapComponentsProvider,
		BaseMapSourceProviderProvider
	],
	exports: [ImageryComponent]
})
export class ImageryModule {

	static provideConfig(config: IImageryConfig): ModuleWithProviders {
		return {
			ngModule: ImageryModule,
			providers: [createConfig(config)]
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
			providers: createComponentCollection(components)
		};
	}

	static provideMapSourceProviders(mapSourceProviders: BaseMapSourceProviderConstructor[]): ModuleWithProviders {
		return {
			ngModule: ImageryModule,
			providers: createMapSourceProviders(mapSourceProviders)
		}
	}

}
