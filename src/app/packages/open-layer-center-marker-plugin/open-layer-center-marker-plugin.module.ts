import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryModule, ImageryProviderService } from '@ansyn/imagery';
import { CenterMarkerPlugin } from './plugin/center-marker-plugin';

@NgModule({
	imports: [CommonModule, ImageryModule],
	providers: [],
})

export class OpenLayerCenterMarkerPluginModule {
	constructor(imageryProviderService: ImageryProviderService) {
		imageryProviderService.registerPlugin('openLayersMap', CenterMarkerPlugin);
	}
}
