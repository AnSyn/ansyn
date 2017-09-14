import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainerComponent } from './container/container.component';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { IContextConfig } from './context.interface';

export const ContextConfig: InjectionToken<IContextConfig> = new InjectionToken('ContextConfig');

@NgModule({
	imports: [
		CommonModule,
		FormsModule
	],
	exports: [ContainerComponent],
	declarations: [ContainerComponent]
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
