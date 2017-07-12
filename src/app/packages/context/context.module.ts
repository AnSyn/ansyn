import { Inject, InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainerComponent } from './container/container.component';
import { FormsModule } from '@angular/forms';
import { ContextProviderService } from './providers/context-provider.service';

import { ContextEleasticSource } from './providers/context-elastic-source';
import { ContextProxySource } from './providers/context-proxy-source';
import { Http, HttpModule } from '@angular/http';
import { IContextSource, IContextSourceConfig } from './context.interface';

//this must be here in order to use it in InjectionToken
export interface IContextConfig  {
	contextSources: IContextSourceConfig[];
}

export const ContextConfig: InjectionToken<IContextConfig> = new InjectionToken('config');

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		HttpModule
	],
	exports: [ContainerComponent],
	declarations: [ContainerComponent]
})

export class ContextModule {

	static forRoot(config: IContextConfig): ModuleWithProviders {
		return {
			ngModule: ContextModule,
			providers: [
				{provide: ContextConfig, useValue: config},
				ContextProviderService
			]

		};
	}

	constructor(private contextProvidersService: ContextProviderService,
				@Inject(ContextConfig) private contextConfig: IContextConfig,
				public http: Http) {

		this.contextConfig.contextSources.forEach( (itemConfig: IContextSourceConfig) => {
			if (!itemConfig.available) {
				return;
			}
			const instance: IContextSource = this.factory(itemConfig);
			contextProvidersService.register(itemConfig.type, instance);
		});
	}

	factory(config: IContextSourceConfig): IContextSource {
		switch (config.type) {
			case 'Elastic' :
				return new ContextEleasticSource(config);
			case 'Proxy' :
				return new ContextProxySource(config, this.http);
		}
	}
}
