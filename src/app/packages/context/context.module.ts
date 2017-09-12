import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainerComponent } from './container/container.component';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ContextElasticSource } from './providers/context-elastic-source.service';
import { BaseContextSourceProvider } from './context.interface';

// this must be here in order to use it in InjectionToken
export type IContextConfig = any;

export const ContextConfig: InjectionToken<IContextConfig> = new InjectionToken('ContextConfig');

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		HttpModule
	],
	exports: [ContainerComponent],
	declarations: [ContainerComponent],
	providers: [
		{ provide: BaseContextSourceProvider, useClass: ContextElasticSource}
	]
})
export class ContextModule {
	static forRoot(config: IContextConfig): ModuleWithProviders {
		return {
			ngModule: ContextModule,
			providers: [
				{ provide: ContextConfig, useValue: config }
			]
		};
	}
}
