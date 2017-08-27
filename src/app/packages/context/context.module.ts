import { Inject, InjectionToken, ModuleWithProviders, NgModule, ReflectiveInjector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainerComponent } from './container/container.component';
import { FormsModule } from '@angular/forms';
import { ContextProviderService } from './providers/context-provider.service';
import { Http, HttpModule } from '@angular/http';
import { IContextSource, IContextSourceConfig } from './context.interface';

//this must be here in order to use it in InjectionToken
export interface IContextConfig  {
	contextSources: IContextSourceConfig[];
}

export interface  IContextSources {
	sources: any;
}

export const ContextConfig: InjectionToken<IContextConfig> = new InjectionToken('ContextConfig');
export const ContextSources: InjectionToken<IContextSources> = new InjectionToken('ContextSources');

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		HttpModule
	],
	exports: [ContainerComponent],
	declarations: [ContainerComponent],
	providers: [
		ContextProviderService
	]
})
export class ContextModule {
	static forRoot(config: IContextConfig, sources: IContextSources): ModuleWithProviders {
		return {
			ngModule: ContextModule,
			providers: [
				ContextProviderService,
				{provide: ContextConfig, useValue: config},
				{provide: ContextSources ,useValue: sources}
			]
		};
	}

	constructor(public contextProviderService: ContextProviderService, @Inject(ContextSources)sourcesHandler, @Inject(ContextConfig)config:IContextConfig,private http: Http){
		this.register(config,sourcesHandler);

	}

	register(config,sourcesHandler){
		config.contextSources.forEach(( itemConfig: IContextSourceConfig ) => {
			if (!itemConfig.available) {
				return;
			}
			const object: IContextSource = sourcesHandler[itemConfig.type];
			const gateway = this.getGateway(itemConfig.apiObject);
			const instance: IContextSource = new  (<any>object)(itemConfig,gateway );
			this.contextProviderService.register(itemConfig.type, instance);
		});
	}

	getGateway(apiObject){
		if(apiObject === "Http"){
			return this.http;
		}
		return undefined;

	}
}
