import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NorthCalculationsPlugin } from '@ansyn/plugins/openlayers/north-calculations/north-calculations.plugin';
import { VisualizersProviders } from '@ansyn/plugins/openlayers/visualizers/visualizers-providers';
import { ImageProcessingPlugin } from '@ansyn/plugins/openlayers/image-processing/image-processing.plugin';
import { MonitorPlugin } from '@ansyn/plugins/openlayers/monitor/monitor.plugin';
import { CenterMarkerPlugin } from '@ansyn/plugins/openlayers/center-marker/center-marker.plugin';
import { OpenLayersMapModule } from '@ansyn/plugins/openlayers/open-layers-map/open-layers-map.module';
import { ImageryModule } from '@ansyn/imagery/imagery.module';
import { ContextMenuPlugin } from '@ansyn/plugins/openlayers/context-menu/context-menu.plugin';

@NgModule({
	imports: [
		CommonModule,
		OpenLayersMapModule,
		ImageryModule.provideCollection([
			NorthCalculationsPlugin,
			CenterMarkerPlugin,
			ImageProcessingPlugin,
			MonitorPlugin,
			ContextMenuPlugin,
			...VisualizersProviders
		])
	]
})
export class AnsynPluginsModule {

}
