import { NgModule } from '@angular/core';
import { OpenlayersMapComponent } from './openlayers-map/openlayers-map.component';
import { OpenLayersDisabledMapComponent } from './openlayers-disabled-map/openlayers-disabled-map.component';
import { ImageryModule } from '@ansyn/imagery/imagery.module';


@NgModule({
	imports: [ImageryModule.provideMapComponents([OpenlayersMapComponent, OpenLayersDisabledMapComponent])],
	declarations: [OpenlayersMapComponent, OpenLayersDisabledMapComponent]
})
export class OpenLayersMapModule {
}
