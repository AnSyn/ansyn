/**
 * Created by AsafMas on 07/05/2017.
 */
import {NgModule} from '@angular/core';
import { OpenLayerComponent } from './map/openLayer.component';
import { ImageryModule } from '@ansyn/imagery/imagery.module';
import { ImageryProviderService } from '@ansyn/imagery/imageryProviderService/imageryProvider.service';

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
