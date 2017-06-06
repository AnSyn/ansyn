/**
 * Created by AsafMas on 07/05/2017.
 */
import {NgModule} from '@angular/core';
import { MapComponent } from './map-component/map.component';
import { ImageryModule, ImageryProviderService } from '@ansyn/imagery';

@NgModule({
	imports: [ImageryModule],
	declarations: [MapComponent],
	providers: [],
	exports: [MapComponent],
	entryComponents: [MapComponent]
})
export class OpenLayerMapModule {
	constructor(imageryProviderService: ImageryProviderService) {
		imageryProviderService.registerMapProvider(MapComponent.mapType, MapComponent);
	}
}
