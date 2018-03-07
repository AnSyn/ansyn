import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryModule, ImageryProviderService } from '@ansyn/imagery';
import { CenterMarkerPlugin } from './plugin/center-marker-plugin';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';

@NgModule({
	imports: [CommonModule, ImageryModule],
	providers: []
})

export class OpenLayerCenterMarkerPluginModule {
	constructor(protected imageryProviderService: ImageryProviderService,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
		imageryProviderService.registerPlugin('openLayersMap', CenterMarkerPlugin, imageryCommunicatorService);
	}
}
