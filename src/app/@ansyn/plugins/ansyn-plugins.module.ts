import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NorthCalculationsPlugin } from '@ansyn/plugins/openlayers/north-calculations/north-calculations.plugin';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { VisualizersProviders } from '@ansyn/plugins/openlayers/visualizers/visualizers-providers';
import { ImageProcessingPlugin } from "@ansyn/plugins/openlayers/image-processing/image-processing.plugin";
import { MonitorPlugin } from '@ansyn/plugins/openlayers/monitor/monitor.plugin';
import { CenterMarkerPlugin } from '@ansyn/plugins/openlayers/center-marker/center-marker.plugin';
import { OpenLayersMapModule } from '@ansyn/plugins/openlayers/open-layers-map/open-layers-map.module';
import { ImageryModule } from '@ansyn/imagery/imagery.module';
import { BaseImageryPlugin } from '@ansyn/imagery/model/base-imagery-plugin';
import { LoggerService } from '@ansyn/core/services/logger.service';
import { ContextMenuPlugin } from '@ansyn/plugins/openlayers/context-menu/context-menu.plugin';

@NgModule({
	imports: [
		CommonModule,
		OpenLayersMapModule,
		ImageryModule.provideCollection([
			{ provide: BaseImageryPlugin, useClass: NorthCalculationsPlugin, deps: [Actions, LoggerService, Store, ProjectionService], multi: true },
			{ provide: BaseImageryPlugin, useClass: CenterMarkerPlugin, deps: [], multi: true },
			{ provide: BaseImageryPlugin, useClass: ImageProcessingPlugin, deps: [Store], multi: true },
			{ provide: BaseImageryPlugin, useClass: MonitorPlugin, deps: [Store], multi: true },
			{ provide: BaseImageryPlugin, useClass: ContextMenuPlugin, deps: [Store, Actions, ProjectionService], multi: true },
			...VisualizersProviders
		])
	]
})
export class AnsynPluginsModule {

}
