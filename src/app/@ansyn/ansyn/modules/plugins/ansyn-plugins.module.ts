import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpenlayersPluginsModule } from './openlayers/openlayers.plugins.module';
import { CesiumPluginsModule } from './cesium/cesium.plugins.module';
import { ImageryChangeMapComponent } from './components/imagery-change-map/imagery-change-map.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	imports: [
		CommonModule,
		TranslateModule,
		OpenlayersPluginsModule,
		CesiumPluginsModule
	],
	declarations: [ImageryChangeMapComponent],
	entryComponents: [ImageryChangeMapComponent]
})
export class AnsynPluginsModule {

}
