import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryModule, ImageryProviderService } from '@ansyn/imagery';
import { NorthCalculationsPlugin } from './plugin/north-calculations-plugin';

@NgModule({
	imports: [CommonModule, ImageryModule],
	providers: []
})

export class OpenLayersNorthCalculationsModule {
	constructor(protected imageryProviderService: ImageryProviderService) {
		imageryProviderService.registerPlugin('openLayersMap', NorthCalculationsPlugin);
	}
}
