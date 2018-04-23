import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpenLayersMapModule } from './openlayers/open-layers-map';
import { BaseImageryPlugin, ImageryModule } from '@ansyn/imagery';
import { NorthCalculationsPlugin } from '@ansyn/plugins/openlayers/north-calculations/north-calculations.plugin';
import { Actions } from '@ngrx/effects';
import { LoggerService } from '@ansyn/core';
import { Store } from '@ngrx/store';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { VisualizersProviders } from '@ansyn/plugins/openlayers/visualizers/visualizers-providers';
import { ImageProcessingPlugin } from "@ansyn/plugins/openlayers/image-processing/image-processing.plugin";
import { MonitorPlugin } from '@ansyn/plugins/openlayers/monitor/monitor.plugin';
import { CenterMarkerPlugin } from '@ansyn/plugins/openlayers/center-marker/center-marker.plugin';

@NgModule({
	imports: [
		CommonModule,
		OpenLayersMapModule,
		ImageryModule.provideCollection([
			{ provide: BaseImageryPlugin, useClass: NorthCalculationsPlugin, deps: [Actions, LoggerService, Store, ProjectionService], multi: true },
			{ provide: BaseImageryPlugin, useClass: CenterMarkerPlugin, deps: [], multi: true },
			{ provide: BaseImageryPlugin, useClass: ImageProcessingPlugin, deps: [Actions], multi: true },
			{ provide: BaseImageryPlugin, useClass: MonitorPlugin, deps: [Store], multi: true },
			...VisualizersProviders
		])
	]
})
export class AnsynPluginsModule {

}
