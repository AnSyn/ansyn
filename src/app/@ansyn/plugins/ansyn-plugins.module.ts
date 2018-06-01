import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NorthCalculationsPlugin } from '@ansyn/plugins/openlayers/north-calculations/north-calculations.plugin';
import { ImageProcessingPlugin } from '@ansyn/plugins/openlayers/image-processing/image-processing.plugin';
import { MonitorPlugin } from '@ansyn/plugins/openlayers/monitor/monitor.plugin';
import { CenterMarkerPlugin } from '@ansyn/plugins/openlayers/center-marker/center-marker.plugin';
import { OpenLayersMapModule } from '@ansyn/plugins/openlayers/open-layers-map/open-layers-map.module';
import { ImageryModule } from '@ansyn/imagery/imagery.module';
import { ContextMenuPlugin } from '@ansyn/plugins/openlayers/context-menu/context-menu.plugin';
import { AnnotationsVisualizer } from '@ansyn/plugins/openlayers/visualizers/tools/annotations.visualizer';
import { PolygonSearchVisualizer } from '@ansyn/plugins/openlayers/visualizers/region/polygon-search.visualizer';
import { GoToVisualizer } from '@ansyn/plugins/openlayers/visualizers/tools/goto.visualizer';
import { ContextEntityVisualizer } from '@ansyn/ansyn/app-providers/app-visualizers/context-entity.visualizer';
import { MouseShadowVisualizer } from '@ansyn/plugins/openlayers/visualizers/tools/mouse-shadow.visualizer';
import { FootprintPolylineVisualizer } from '@ansyn/plugins/openlayers/visualizers/overlays/polyline-visualizer';
import { PinPointVisualizer } from '@ansyn/plugins/openlayers/visualizers/region/pin-point.visualizer';
import { MeasureDistanceVisualizer } from '@ansyn/plugins/openlayers/visualizers/tools/measure-distance.visualizer';
import { FrameVisualizer } from '@ansyn/plugins/openlayers/visualizers/overlays/frame-visualizer';
import { FootprintHeatmapVisualizer } from '@ansyn/plugins/openlayers/visualizers/overlays/heatmap-visualizer';

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
			// Visualizers
			ContextEntityVisualizer,
			FootprintHeatmapVisualizer,
			FrameVisualizer,
			FootprintPolylineVisualizer,
			AnnotationsVisualizer,
			MeasureDistanceVisualizer,
			GoToVisualizer,
			PinPointVisualizer,
			MouseShadowVisualizer,
			PolygonSearchVisualizer
		])
	]
})
export class AnsynPluginsModule {

}
