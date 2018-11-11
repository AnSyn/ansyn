import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImisightSourceProvider } from './imisight-source-provider';
import { ImageryModule } from '@ansyn/imagery';
import { OpenLayersImisightSourceProvider } from './open-layers-imisight-source-provider';
import { CallbackComponent } from './callback/callback.component';
import { CoreModule } from '@ansyn/core';
import { MultipleOverlaysSource } from '@ansyn/overlays';

@NgModule({
	imports: [
		CommonModule,
		CoreModule,
		ImageryModule.provide({
			maps: [],
			plugins: [],
			mapSourceProviders: [
				OpenLayersImisightSourceProvider
			]
		})
	],
	providers: [
		{ provide: MultipleOverlaysSource, useClass: ImisightSourceProvider, multi: true },
	],
	declarations: [CallbackComponent],
	exports: [CallbackComponent]
})
export class ImisightModule {
}
