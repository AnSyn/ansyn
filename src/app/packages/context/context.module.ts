import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainerComponent } from './container/container.component';
import { FormsModule } from '@angular/forms';
import { ContextProviderService } from './providers/context-provider.service';
import { HttpModule } from '@angular/http';

// this must be here in order to use it in InjectionToken
export type IContextConfig  = any;

export const ContextConfig: InjectionToken<IContextConfig> = new InjectionToken('ContextConfig');

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
				ContextProviderService,
				{ provide: ContextConfig, useValue: config }
			]
		};
	}
}
