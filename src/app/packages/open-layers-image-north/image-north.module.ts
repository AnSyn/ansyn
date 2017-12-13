import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryModule, ImageryProviderService } from '@ansyn/imagery';
import { ImageNorthPlugin } from './plugin/image-north-plugin';

@NgModule({
	imports: [CommonModule, ImageryModule],
	providers: []
})

export class ImageNorthModule {
	constructor(imageryProviderService: ImageryProviderService) {
		imageryProviderService.registerPlugin('openLayersMap', ImageNorthPlugin);
	}
}
