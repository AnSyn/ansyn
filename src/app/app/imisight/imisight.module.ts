import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImisightSourceProvider } from './imisight-source-provider';
import { MultipleOverlaysSource } from '@ansyn/ansyn';
import { ImageryModule } from '@ansyn/imagery';
import { OpenLayersImisightSourceProvider } from './open-layers-imisight-source-provider';

@NgModule({
	imports: [
		CommonModule,
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
	declarations: []
})
export class ImisightModule {
}
