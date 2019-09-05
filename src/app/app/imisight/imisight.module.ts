import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImisightSourceProvider } from './imisight-source-provider';
import { ImageryModule } from '@ansyn/imagery';
import { OpenLayersImisightSourceProvider } from './open-layers-imisight-source-provider';
import { CallbackComponent } from './callback/callback.component';
import { CoreModule, OverlaysModule } from '@ansyn/ansyn';
import { MapFacadeModule } from '@ansyn/map-facade';

@NgModule({
	imports: [
		CommonModule,
		CoreModule,
		MapFacadeModule,
		ImageryModule.provide({
			maps: [],
			plugins: [],
			mapSourceProviders: [
				OpenLayersImisightSourceProvider
			]
		}),
		OverlaysModule.provide({
			overlaySourceProviders: [ImisightSourceProvider]
		})
	],
	declarations: [CallbackComponent],
	exports: [CallbackComponent]
})
export class ImisightModule {
}
