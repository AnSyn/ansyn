import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryModule } from '@ansyn/imagery';
import { NorthCalculationsPlugin } from './plugins/north-calculations/north-calculations.plugin';
import { CenterMarkerPlugin } from './plugins/center-marker/center-marker.plugin';
import { ContextMenuPlugin } from '../app/context-menu/context-menu.plugin';
import { MonitorPlugin } from './plugins/monitor/monitor.plugin';
import { ImageProcessingPlugin } from './plugins/image-processing/image-processing.plugin';
import { OpenlayersOsmLayersPlugin } from './plugins/layers/openlayers-osm-layers.plugin';
import { FootprintHeatmapVisualizer } from './plugins/visualizers/overlays/heatmap-visualizer';
import { AlertsPlugin } from '../app/alerts/alerts.plugin';
import { FrameVisualizer } from './plugins/visualizers/overlays/frame-visualizer';
import { FootprintPolylineVisualizer } from './plugins/visualizers/overlays/polyline-visualizer';
import { AnsynAnnotationsVisualizer } from './plugins/visualizers/tools/ansyn.annotations.visualizer';
import { MeasureDistanceVisualizer } from './plugins/visualizers/tools/measure-distance.visualizer';
import { GoToVisualizer } from './plugins/visualizers/tools/goto.visualizer';
import { PinPointVisualizer } from './plugins/visualizers/region/pin-point.visualizer';
import { MouseShadowVisualizer } from './plugins/visualizers/tools/mouse-shadow.visualizer';
import { PolygonSearchVisualizer } from './plugins/visualizers/region/polygon-search.visualizer';
import { OpenlayersGeoJsonLayersVisualizer } from './plugins/layers/openlayers-geoJson-layers.visualizer';
import { TaskRegionVisualizer } from './plugins/visualizers/algorithms/task-region.visualizer';
import { OpenlayersArcgisLayersPulgin } from './plugins/layers/openlayers-arcgis-layers.pulgin';
import {
	AnnotationsContextMenuModule,
	AnnotationsVisualizer,
	OpenLayerBingSourceProvider,
	OpenLayerESRI4326SourceProvider,
	OpenLayerIDAHOSourceProvider,
	OpenLayerMapBoxSourceProvider,
	OpenLayerMarcoSourceProvider,
	OpenLayerOpenAerialSourceProvider,
	OpenLayerOSMSourceProvider,
	OpenLayerPlanetSourceProvider,
	OpenLayersDisabledMap,
	OpenLayersMap,
	OpenLayersStaticImageSourceProvider,
	OpenLayerTileWMSSourceProvider
} from '@ansyn/ol';
import { ScannedAreaVisualizer } from './plugins/visualizers/scanned-area/scanned-area.visualizer';
import { OpenlayersAnaglyphSensorModule } from './plugins/anaglyph-sensor/anaglyph-sensor.module';
import { OpenLayersAirbusSourceProvider } from '@ansyn/ol';
import { OverlayHoverVisualizer } from "./plugins/visualizers/overlays/overlay-hover-visualizer";

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
				OpenlayersArcgisLayersPulgin,
				AlertsPlugin,
				// Visualizers
				FootprintHeatmapVisualizer,
				FrameVisualizer,
				OverlayHoverVisualizer,
				FootprintPolylineVisualizer,
				AnnotationsVisualizer,
				AnsynAnnotationsVisualizer,
				MeasureDistanceVisualizer,
				GoToVisualizer,
				PinPointVisualizer,
				MouseShadowVisualizer,
				PolygonSearchVisualizer,
				OpenlayersGeoJsonLayersVisualizer,
				TaskRegionVisualizer,
				ScannedAreaVisualizer
			],
			maps: [OpenLayersMap, OpenLayersDisabledMap],
			mapSourceProviders: [
				OpenLayerTileWMSSourceProvider,
				OpenLayerMapBoxSourceProvider,
				OpenLayerOSMSourceProvider,
				OpenLayerIDAHOSourceProvider,
				OpenLayerPlanetSourceProvider,
				OpenLayerBingSourceProvider,
				OpenLayerESRI4326SourceProvider,
				OpenLayerOpenAerialSourceProvider,
				OpenLayersStaticImageSourceProvider,
				OpenLayerMarcoSourceProvider,
				OpenLayersAirbusSourceProvider
			]
		}),
		AnnotationsContextMenuModule,
		OpenlayersAnaglyphSensorModule
	]
})
export class OpenlayersPluginsModule {

}
