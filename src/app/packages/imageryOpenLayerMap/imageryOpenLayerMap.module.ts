/**
 * Created by AsafMas on 07/05/2017.
 */
import {NgModule} from '@angular/core';
import { OpenLayerComponent } from './map/openLayer.component';
import { ImageryModule, ImageryProviderService } from '@ansyn/imagery';

@NgModule({
	imports: [ImageryModule],
	declarations: [OpenLayerComponent],
	providers: [],
	exports: [OpenLayerComponent],
	entryComponents: [OpenLayerComponent]
})
export class ImageryOpenLayerMapModule {
	constructor(imageryProviderService: ImageryProviderService) {
		imageryProviderService.registerMapProvider('openLayerMap', OpenLayerComponent);
	}
}
