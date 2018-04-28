import { NgModule } from '@angular/core';
import { CesiumMapComponent } from './cesium-map/cesium-map.component';
import { ImageryModule } from '@ansyn/imagery/imagery.module';
import { ImageryProviderService } from '@ansyn/imagery/provider-service/imagery-provider.service';
import { CesiumMapName } from '@ansyn/plugins/cesium/cesium-map/cesium-map/cesium-map';

@NgModule({
	imports: [ImageryModule],
	declarations: [CesiumMapComponent],
	providers: [],
	exports: [CesiumMapComponent],
	entryComponents: [CesiumMapComponent]
})
export class CesiumMapModule {
	constructor(imageryProviderService: ImageryProviderService) {
		imageryProviderService.registerMapProvider(CesiumMapName, CesiumMapName, CesiumMapComponent);
	}
}
