import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryComponent } from './imagery/imagery.component';
import { ImageryCommunicatorService } from './communicator-service/communicator.service';
import { ImageryProviderService } from './provider-service/imagery-provider.service';
import { IImageryConfig } from './model/iimagery-config';
import { ConfigurationToken } from './model/configuration.token';
import { CacheService } from './cache-service/cache.service';
import { createCollection } from './model/plugins-collection';
import { BaseImageryPluginClass } from '@ansyn/imagery/model/plugins-collection';

@NgModule({
	imports: [CommonModule],
	declarations: [ImageryComponent],
	providers: [
		ImageryProviderService,
		ImageryCommunicatorService,
		{ provide: CacheService, useClass: CacheService, deps: [ConfigurationToken, ImageryCommunicatorService] },
		createCollection([])
	],
	exports: [ImageryComponent]
})
export class ImageryModule {

	static forRoot(config: IImageryConfig): ModuleWithProviders {
		return {
			ngModule: ImageryModule,
			providers: [
				ImageryCommunicatorService,
				ImageryProviderService,
				{ provide: ConfigurationToken, useValue: config }
			]
		};
	}

	static provideCollection(providers: BaseImageryPluginClass[]): ModuleWithProviders {
		return {
			ngModule: ImageryModule,
			providers: [createCollection(providers)]
		};
	}
}
