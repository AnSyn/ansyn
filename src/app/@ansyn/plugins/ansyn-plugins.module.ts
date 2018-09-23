import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryModule } from '@ansyn/imagery';
import { NorthCalculationsPlugin } from './openlayers/north-calculations/north-calculations.plugin';
import { OpenlayersOsmLayersPlugin } from './openlayers/layers/openlayers-osm-layers.plugin';
import { CenterMarkerPlugin } from './openlayers/center-marker/center-marker.plugin';
import { ImageProcessingPlugin } from './openlayers/image-processing/image-processing.plugin';
import { ContextMenuPlugin } from './openlayers/context-menu/context-menu.plugin';
import { MonitorPlugin } from './openlayers/monitor/monitor.plugin';
import { FrameVisualizer } from './openlayers/visualizers/overlays/frame-visualizer';
import { MeasureDistanceVisualizer } from './openlayers/visualizers/tools/measure-distance.visualizer';
import { AnnotationsVisualizer } from './openlayers/visualizers/tools/annotations.visualizer';
import { ContextEntityVisualizer } from './openlayers/visualizers/contexts/context-entity.visualizer';
import { FootprintPolylineVisualizer } from './openlayers/visualizers/overlays/polyline-visualizer';
import { FootprintHeatmapVisualizer } from './openlayers/visualizers/overlays/heatmap-visualizer';
import { GoToVisualizer } from './openlayers/visualizers/tools/goto.visualizer';
import { PinPointVisualizer } from './openlayers/visualizers/region/pin-point.visualizer';
import { OpenLayersMap } from './openlayers/open-layers-map/openlayers-map/openlayers-map';
import { CesiumMap } from './cesium/cesium-map/cesium-map';
import { OpenLayersDisabledMap } from './openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';
import { OpenlayersGeoJsonLayersVisualizer } from './openlayers/layers/openlayers-geoJson-layers.visualizer';
import { PolygonSearchVisualizer } from './openlayers/visualizers/region/polygon-search.visualizer';
import { MouseShadowVisualizer } from './openlayers/visualizers/tools/mouse-shadow.visualizer';

@NgModule({
	imports: [
		CommonModule,
		ImageryModule.provide({
			plugins: [
				NorthCalculationsPlugin,
				CenterMarkerPlugin,
				ImageProcessingPlugin,
				MonitorPlugin,
				ContextMenuPlugin,
				OpenlayersOsmLayersPlugin,
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
				PolygonSearchVisualizer,
				OpenlayersGeoJsonLayersVisualizer
			],
			maps: [OpenLayersMap, OpenLayersDisabledMap, CesiumMap],
			mapSourceProviders: []
		})
	]
})
export class AnsynPluginsModule {

}
