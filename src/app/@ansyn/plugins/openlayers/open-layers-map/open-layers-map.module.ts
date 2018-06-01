import { NgModule } from '@angular/core';
import { OpenlayersMapComponent } from './openlayers-map/openlayers-map.component';
import { OpenLayersDisabledMapComponent } from './openlayers-disabled-map/openlayers-disabled-map.component';
import { DisabledOpenLayersMapName } from './openlayers-disabled-map/openlayers-disabled-map';
import { ImageryModule } from '@ansyn/imagery/imagery.module';
import { ImageryProviderService } from '@ansyn/imagery/provider-service/imagery-provider.service';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';

@NgModule({
	imports: [ImageryModule],
	declarations: [OpenlayersMapComponent, OpenLayersDisabledMapComponent],
	providers: [],
	exports: [OpenlayersMapComponent, OpenLayersDisabledMapComponent],
	entryComponents: [OpenlayersMapComponent, OpenLayersDisabledMapComponent]
})
export class OpenLayersMapModule {
	constructor(imageryProviderService: ImageryProviderService) {
		imageryProviderService.registerMapProvider(OpenlayersMapName, OpenlayersMapName, OpenlayersMapComponent);
		imageryProviderService.registerMapProvider(DisabledOpenLayersMapName, DisabledOpenLayersMapName, OpenLayersDisabledMapComponent);
	}
}
