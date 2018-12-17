import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryModule } from '@ansyn/imagery';
import { OpenLayerTBSourceProvider } from './map-source-provider/open-layers-TB-source-provider';
import { MultipleOverlaysSource, OverlaysModule } from '@ansyn/overlays';
import { TBSourceProvider } from './overlay-source-provider/tb-source-provider';

@NgModule({
	imports: [
		CommonModule,
		ImageryModule.provide({
			mapSourceProviders: [
				OpenLayerTBSourceProvider
			],
			plugins: [],
			maps: []
		}),
		OverlaysModule.provide({
			overlaySourceProviders: [TBSourceProvider]
		})
	]
})
export class DroneModule {
}
