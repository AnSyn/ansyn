import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryModule } from '@ansyn/imagery';
import { OpenLayerTBSourceProvider } from './map-source-provider/open-layers-TB-source-provider';
import { OverlaysModule } from '@ansyn/overlays';
import { TBSourceProvider } from './overlay-source-provider/tb-source-provider';
import { UploadsModule } from './uploads/uploads.module';
import { PopupPlugins } from "./plugins/popup/popup.plugins";
import { OpenLayersMap } from "@ansyn/plugins";
import { StorageService } from '@ansyn/core';
import { StorageServiceExtends } from './extends/storage.service.extends';
import { CasesService } from '@ansyn/menu-items';
import { CasesServiceExtends } from './extends/cases.service.extends';
import { ContactUsModule } from './contact-us/contact-us.module';

@NgModule({
	imports: [
		CommonModule,
		ContactUsModule,
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
	],
	providers: [
		{
			provide: StorageService,
			useClass: StorageServiceExtends
		},
		{
			provide: CasesService,
			useClass: CasesServiceExtends
		}
	]
})
export class DroneModule {
}
