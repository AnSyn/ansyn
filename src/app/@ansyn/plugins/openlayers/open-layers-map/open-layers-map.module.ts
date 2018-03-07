import { NgModule } from '@angular/core';
import { OpenlayersMapComponent } from './openlayers-map/openlayers-map.component';
import { ImageryModule, ImageryProviderService } from '@ansyn/imagery';
import { DisabledMapComponent } from './disabled-map/disabled-map.component';
import { OpenLayersMap } from './openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from './disabled-map/open-layers-disabled-map';
import { OpenLayersProjectionService } from '@ansyn/open-layers-map/open-layers-projection.service';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';

@NgModule({
	imports: [ImageryModule],
	declarations: [OpenlayersMapComponent, DisabledMapComponent],
	providers: [{provide: ProjectionService, useClass: OpenLayersProjectionService}],
	exports: [OpenlayersMapComponent, DisabledMapComponent],
	entryComponents: [OpenlayersMapComponent, DisabledMapComponent]
})
export class OpenLayersMapModule {
	constructor(imageryProviderService: ImageryProviderService) {
		imageryProviderService.registerMapProvider(OpenlayersMapComponent.mapName, OpenLayersMap.mapType, OpenlayersMapComponent);
		imageryProviderService.registerMapProvider(DisabledMapComponent.mapName, OpenLayersDisabledMap.mapType, DisabledMapComponent);
	}
}
