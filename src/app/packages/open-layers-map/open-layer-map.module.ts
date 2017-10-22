import { NgModule } from '@angular/core';
import { MapComponent } from './map/map.component';
import { ImageryModule, ImageryProviderService } from '@ansyn/imagery';
import { DisabledMapComponent } from './disabled-map/disabled-map.component';
import { OpenLayersMap } from './map/open-layers-map';
import { OpenLayersDisabledMap } from './disabled-map/open-layers-disabled-map';

@NgModule({
	imports: [ImageryModule],
	declarations: [MapComponent, DisabledMapComponent],
	providers: [],
	exports: [MapComponent, DisabledMapComponent],
	entryComponents: [MapComponent, DisabledMapComponent]
})
export class OpenLayerMapModule {
	constructor(imageryProviderService: ImageryProviderService) {
		imageryProviderService.registerMapProvider(MapComponent.mapName, OpenLayersMap.mapType, MapComponent);
		imageryProviderService.registerMapProvider(DisabledMapComponent.mapName, OpenLayersDisabledMap.mapType, DisabledMapComponent);
	}
}
