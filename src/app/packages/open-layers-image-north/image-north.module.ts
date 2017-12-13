import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryModule, ImageryProviderService } from '@ansyn/imagery';
import { ImageNorthPlugin } from './plugin/image-north-plugin';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';

@NgModule({
	imports: [CommonModule, ImageryModule],
	providers: []
})

export class ImageNorthModule {
	constructor(protected imageryProviderService: ImageryProviderService,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
		imageryProviderService.registerPlugin('openLayersMap', ImageNorthPlugin, imageryCommunicatorService);
	}
}
