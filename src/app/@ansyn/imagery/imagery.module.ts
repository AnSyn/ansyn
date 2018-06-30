import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryComponent } from './imagery/imagery.component';
import { ImageryCommunicatorService } from './communicator-service/communicator.service';
import { IImageryConfig, initialImageryConfig } from './model/iimagery-config';
import { IMAGERY_CONFIG } from './model/configuration.token';
import { CacheService } from './cache-service/cache.service';
import { createCollection } from './model/plugins-collection';
import { ImageryCollectionEntity } from '@ansyn/imagery/model/plugins-collection';
import {
	IMAGERY_IMAP_COLLECTION, IMAGERY_IMAP,
	ImageryIMapFactory
} from '@ansyn/imagery/model/imap-collection';
import { MapComponent } from './map/map.component';
import { IMapConstructor } from '@ansyn/imagery/model/imap';

@NgModule({
	imports: [CommonModule],
	declarations: [ImageryComponent, MapComponent],
	entryComponents: [MapComponent],
	providers: [
		{ provide: IMAGERY_CONFIG, useValue: initialImageryConfig },
		ImageryCommunicatorService,
		{ provide: CacheService, useClass: CacheService, deps: [IMAGERY_CONFIG, ImageryCommunicatorService] },
		createCollection([]),
		{
			provide: IMAGERY_IMAP,
			useFactory: ImageryIMapFactory,
			deps: [IMAGERY_IMAP_COLLECTION]
		}
	],
	exports: [ImageryComponent]
})
export class ImageryModule {
	static forRoot(config: IImageryConfig): ModuleWithProviders {
		return {
			ngModule: ImageryModule,
			providers: [
				ImageryCommunicatorService,
				{ provide: IMAGERY_CONFIG, useValue: config }
			]
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
}
