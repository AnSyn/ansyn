import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryModule } from '@ansyn/imagery';
import { OpenLayerTBSourceProvider } from './map-source-provider/open-layers-TB-source-provider';
import { OverlaysModule } from '@ansyn/overlays';
import { TBSourceProvider } from './overlay-source-provider/tb-source-provider';
import { MenuModule } from '@ansyn/menu';
import { droneMenuItems } from './drone-menu-items';
import { UploadsModule } from './uploads/uploads.module';

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
		}),
		UploadsModule,
		MenuModule.provideMenuItems(droneMenuItems)
	]
})
export class DroneModule {
}
