import { ANALYZE_FOR_ENTRY_COMPONENTS, Injector, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryComponent } from './imagery/imagery.component';
import { ImageryCommunicatorService } from './communicator-service/communicator.service';
import { IImageryConfig, initialImageryConfig } from './model/iimagery-config';
import { CacheService } from './cache-service/cache.service';
import { createCollection, ImageryCollectionEntity } from './providers/plugins-collection';
import { ImageryMapComponentConstructor } from './model/imagery-map-component';
import { BaseMapSourceProviderConstructor } from './model/base-map-source-provider';
import { BaseMapSourceProviderProvider, createMapSourceProviders } from './providers/map-source-providers';
import { createComponentCollection, MapComponentsProvider } from './providers/map-components';
import { createConfig } from './providers/config';

@NgModule({
	imports: [CommonModule],
	declarations: [ImageryComponent],
	providers: [
		ImageryCommunicatorService,
		CacheService,
		createConfig(initialImageryConfig),
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
