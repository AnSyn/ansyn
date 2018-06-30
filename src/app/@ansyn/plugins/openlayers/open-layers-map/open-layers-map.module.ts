import { NgModule } from '@angular/core';
import { ImageryModule } from '@ansyn/imagery/imagery.module';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import {
	OpenLayersDisabledMap
} from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';


@NgModule({
	imports: [ImageryModule.provideIMaps([OpenLayersMap, OpenLayersDisabledMap])]
})
export class OpenLayersMapModule {
}
