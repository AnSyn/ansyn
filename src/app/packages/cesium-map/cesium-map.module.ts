/**
 * Created by AsafMas on 11/05/2017.
 */
import {NgModule} from '@angular/core';
import { MapComponent } from './map/map.component';
import { ImageryModule } from '@ansyn/imagery/imagery.module';
import { ImageryProviderService } from '@ansyn/imagery';

@NgModule({
	imports: [ImageryModule],
	declarations: [MapComponent],
	providers: [],
	exports: [MapComponent],
	entryComponents: [MapComponent]
})
export class CesiumMapModule {
	constructor(imageryProviderService: ImageryProviderService) {
		imageryProviderService.registerMapProvider(MapComponent.mapType, MapComponent);
	}
}
