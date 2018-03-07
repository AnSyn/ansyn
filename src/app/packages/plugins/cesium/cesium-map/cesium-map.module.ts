import { NgModule } from '@angular/core';
import { CesiumMapComponent } from './cesium-map/cesium-map.component';
import { ImageryModule } from 'app/packages/imagery/imagery.module';
import { ImageryProviderService } from 'app/packages/imagery/index';
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
