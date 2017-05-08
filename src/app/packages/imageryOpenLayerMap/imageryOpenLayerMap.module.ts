/**
 * Created by AsafMas on 07/05/2017.
 */
import {NgModule} from '@angular/core';
import { OpenLayerComponent } from './map/openLayer.component';
import { RegisterToImageryProviderService } from './services/registerToImageryProvider.service';
import { ImageryModule } from '@ansyn/imagery/imagery.module';

@NgModule({
	imports: [ImageryModule],
	declarations: [OpenLayerComponent],
	providers: [RegisterToImageryProviderService],
	exports: [OpenLayerComponent],
	entryComponents: [OpenLayerComponent]
})
export class ImageryOpenLayerMapModule {
	constructor(registerToImageryProviderService: RegisterToImageryProviderService) {

	}
}
