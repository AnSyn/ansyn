import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryComponent } from './imagery/imagery.component';
import { ImageryCommunicatorService } from './communicator-service/communicator.service';
import { IImageryConfig, initialImageryConfig } from './model/iimagery-config';
import { CacheService } from './cache-service/cache.service';
import {
	IMAGERY_IMAP_COLLECTION, IMAGERY_IMAP,
	ImageryIMapFactory
} from './model/imap-collection';
import { MapComponent } from './map/map.component';
import { IMapConstructor } from './model/imap';
import { BaseMapSourceProviderConstructor } from './model/base-map-source-provider';
import { BaseMapSourceProviderProvider, createMapSourceProviders } from './providers/map-source-providers';
import { createConfig } from './providers/config';
import { createCollection, ImageryCollectionEntity } from './providers/plugins-collection';

@NgModule({
	imports: [CommonModule],
	declarations: [ImageryComponent, MapComponent],
	entryComponents: [MapComponent],
	providers: [
		ImageryCommunicatorService,
		CacheService,
		createConfig(initialImageryConfig),
		createCollection([]),
		{
			provide: IMAGERY_IMAP,
			useFactory: ImageryIMapFactory,
			deps: [IMAGERY_IMAP_COLLECTION]
		},
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

	static provideIMaps(imaps: IMapConstructor[]): ModuleWithProviders {
		return {
			ngModule: ImageryModule,
			providers: [
				{
					provide: IMAGERY_IMAP_COLLECTION,
					useValue: imaps,
					multi: true
				}
			]
		};
	}

	static provideMapSourceProviders(mapSourceProviders: BaseMapSourceProviderConstructor[]): ModuleWithProviders {
		return {
			ngModule: ImageryModule,
			providers: createMapSourceProviders(mapSourceProviders)
		}
	}

}
