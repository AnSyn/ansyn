import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpenLayersMapModule } from './openlayers/open-layers-map';
import { BaseImageryPlugin, ImageryModule } from '@ansyn/imagery';
import { NorthCalculationsPlugin } from './openlayers/open-layers-north-calculations/plugin/north-calculations-plugin';
import { CenterMarkerPlugin } from '@ansyn/plugins/openlayers/open-layer-center-marker-plugin';
import { Actions } from '@ngrx/effects';
import { LoggerService } from '@ansyn/core';
import { Store } from '@ngrx/store';

@NgModule({
	imports: [
		CommonModule,
		OpenLayersMapModule,
		ImageryModule.provideCollection([
			{ provide: BaseImageryPlugin, useClass: NorthCalculationsPlugin, deps: [Actions, LoggerService, Store], multi: true },
			{ provide: BaseImageryPlugin, useClass: CenterMarkerPlugin, deps: [], multi: true }
		])
	]
})
export class AnsynPluginsModule {

}
