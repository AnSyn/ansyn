import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryModule } from '@ansyn/imagery';
import { OpenLayerTBSourceProvider } from './map-source-provider/open-layers-TB-source-provider';
import { OverlaysModule } from '@ansyn/overlays';
import { TBSourceProvider } from './overlay-source-provider/tb-source-provider';
import { UploadsModule } from './uploads/uploads.module';
import { PopupPlugins } from "./plugins/popup/popup.plugins";
import { OpenLayersMap } from "@ansyn/plugins";

@NgModule({
	imports: [
		CommonModule,
		ImageryModule.provide({
			mapSourceProviders: [
				OpenLayerTBSourceProvider
			],
			plugins: [PopupPlugins],
			maps: [OpenLayersMap]
		}),
		OverlaysModule.provide({
			overlaySourceProviders: [TBSourceProvider]
		}),
		UploadsModule
	]
})
export class DroneModule {
}
