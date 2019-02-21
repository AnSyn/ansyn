import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryModule } from '@ansyn/imagery';
import { OpenLayerTBSourceProvider } from './map-source-provider/open-layers-TB-source-provider';
import { OverlaysModule } from '@ansyn/overlays';
import { TBSourceProvider } from './overlay-source-provider/tb-source-provider';
import { AnsynPluginsModule, CesiumMap, OpenLayersMap } from "@ansyn/plugins";
import { CesiumTBSourceProvider } from "./map-source-provider/cesium-TB-source-provider";

@NgModule({
	imports: [
		CommonModule,
		AnsynPluginsModule,
		ImageryModule.provide({
			mapSourceProviders: [
				OpenLayerTBSourceProvider,
				CesiumTBSourceProvider
			],
			plugins: [],
			maps: [OpenLayersMap, CesiumMap]
		}),
		OverlaysModule.provide({
			overlaySourceProviders: [TBSourceProvider]
		})
	]
})
export class DroneModule {
}
