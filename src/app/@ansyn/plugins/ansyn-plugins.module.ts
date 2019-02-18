import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpenlayersPluginsModule } from './openlayers/openlayers.plugins.module';
import { CesiumPluginsModule } from './cesium/cesium.plugins.module';

@NgModule({
	imports: [
		CommonModule,
		OpenlayersPluginsModule,
		CesiumPluginsModule
	]
})
export class AnsynPluginsModule {

}
