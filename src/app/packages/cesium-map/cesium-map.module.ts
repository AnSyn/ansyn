import { NgModule } from '@angular/core';
import { CesiumMapComponent } from './cesium-map/cesium-map.component';
import { ImageryModule } from '@ansyn/imagery/imagery.module';
import { ImageryProviderService } from '@ansyn/imagery';
import { CesiumMap } from './cesium-map/cesium-map';

@NgModule({
	imports: [ImageryModule],
	declarations: [CesiumMapComponent],
	providers: [],
	exports: [CesiumMapComponent],
	entryComponents: [CesiumMapComponent]
})
export class CesiumMapModule {
	constructor(imageryProviderService: ImageryProviderService) {
		imageryProviderService.registerMapProvider(CesiumMapComponent.mapName, CesiumMap.mapType, CesiumMapComponent);
	}
}
