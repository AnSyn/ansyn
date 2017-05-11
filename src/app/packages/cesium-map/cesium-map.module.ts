/**
 * Created by AsafMas on 11/05/2017.
 */
import {NgModule} from '@angular/core';
import { CesiumComponent } from './map/cesium.component';
import { ImageryModule } from '@ansyn/imagery/imagery.module';
import { ImageryProviderService } from '@ansyn/imagery';

@NgModule({
	imports: [ImageryModule],
	declarations: [CesiumComponent],
	providers: [],
	exports: [CesiumComponent],
	entryComponents: [CesiumComponent]
})
export class ImageryCesiumMapModule {
	constructor(imageryProviderService: ImageryProviderService) {
		imageryProviderService.registerMapProvider('cesiumMap', CesiumComponent);
	}
}
