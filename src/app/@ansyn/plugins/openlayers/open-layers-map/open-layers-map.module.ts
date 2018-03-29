import { NgModule } from '@angular/core';
import { OpenlayersMapComponent } from './openlayers-map/openlayers-map.component';
import { ImageryModule, ImageryProviderService } from '@ansyn/imagery';
import { OpenLayersDisabledMapComponent } from './openlayers-disabled-map/openlayers-disabled-map.component';
import { OpenLayersMap } from './openlayers-map/openlayers-map';
import { DisabledOpenLayersMapName, OpenLayersDisabledMap } from './openlayers-disabled-map/openlayers-disabled-map';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map';

@NgModule({
	imports: [ImageryModule],
	declarations: [OpenlayersMapComponent, OpenLayersDisabledMapComponent],
	providers: [],
	exports: [OpenlayersMapComponent, OpenLayersDisabledMapComponent],
	entryComponents: [OpenlayersMapComponent, OpenLayersDisabledMapComponent]
})
export class OpenLayersMapModule {
	constructor(imageryProviderService: ImageryProviderService) {
		imageryProviderService.registerMapProvider(OpenlayersMapName, OpenLayersMap.mapType, OpenlayersMapComponent);
		imageryProviderService.registerMapProvider(DisabledOpenLayersMapName, OpenLayersDisabledMap.mapType, OpenLayersDisabledMapComponent);
	}
}
