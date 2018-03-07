import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpenLayerCenterMarkerPluginModule } from './openlayers/open-layer-center-marker-plugin';
import { OpenLayersNorthCalculationsModule } from './openlayers/open-layers-north-calculations';
import { OpenLayersMapModule } from './openlayers/open-layers-map';

@NgModule({
	imports: [
		CommonModule,
		OpenLayerCenterMarkerPluginModule,
		OpenLayersNorthCalculationsModule,
		OpenLayersMapModule
	]
})
export class AnsynPluginsModule {

}
