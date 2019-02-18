import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryModule } from '@ansyn/imagery';
import { NorthCalculationsPlugin } from './plugins/north-calculations/north-calculations.plugin';
import { CenterMarkerPlugin } from './plugins/center-marker/center-marker.plugin';
import { ContextMenuPlugin } from './plugins/context-menu/context-menu.plugin';
import { MonitorPlugin } from './plugins/monitor/monitor.plugin';
import { ImageProcessingPlugin } from './plugins/image-processing/image-processing.plugin';
import { OpenlayersOsmLayersPlugin } from './plugins/layers/openlayers-osm-layers.plugin';
import { FootprintHeatmapVisualizer } from './plugins/visualizers/overlays/heatmap-visualizer';
import { AlertsPlugin } from './plugins/alerts/alerts.plugin';
import { ContextEntityVisualizer } from './plugins/visualizers/contexts/context-entity.visualizer';
import { FrameVisualizer } from './plugins/visualizers/overlays/frame-visualizer';
import { FootprintPolylineVisualizer } from './plugins/visualizers/overlays/polyline-visualizer';
import { AnnotationsVisualizer } from './plugins/visualizers/tools/annotations.visualizer';
import { MeasureDistanceVisualizer } from './plugins/visualizers/tools/measure-distance.visualizer';
import { GoToVisualizer } from './plugins/visualizers/tools/goto.visualizer';
import { PinPointVisualizer } from './plugins/visualizers/region/pin-point.visualizer';
import { MouseShadowVisualizer } from './plugins/visualizers/tools/mouse-shadow.visualizer';
import { PolygonSearchVisualizer } from './plugins/visualizers/region/polygon-search.visualizer';
import { OpenlayersGeoJsonLayersVisualizer } from './plugins/layers/openlayers-geoJson-layers.visualizer';
import { TaskRegionVisualizer } from './plugins/visualizers/algorithms/task-region.visualizer';
import { OpenLayersMap } from './maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from './maps/openlayers-disabled-map/openlayers-disabled-map';
import { OpenLayerTileWMSSourceProvider } from './mapSourceProviders/open-layers-TileWMS-source-provider';
import { OpenLayerMapBoxSourceProvider } from './mapSourceProviders/open-layers-MapBox-source-provider';
import { OpenLayerOSMSourceProvider } from './mapSourceProviders/open-layers-OSM-source-provider';
import { OpenLayerIDAHOSourceProvider } from './mapSourceProviders/open-layers-IDAHO-source-provider';
import { OpenLayerPlanetSourceProvider } from './mapSourceProviders/open-layers-planet-source-provider';
import { OpenLayerBingSourceProvider } from './mapSourceProviders/open-layers-BING-source-provider';
import { OpenLayerESRI4326SourceProvider } from './mapSourceProviders/open-layers-ESRI-4326-source-provider';
import { OpenLayerOpenAerialSourceProvider } from './mapSourceProviders/open-layers-open-aerial-source-provider';
import { OpenLayersStaticImageSourceProvider } from './mapSourceProviders/open-layers-static-image-source-provider';
import { OpenlayersArcgisLayersPulgin } from "./plugins/layers/openlayers-arcgis-layers.pulgin";

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
				OpenlayersGeoJsonLayersVisualizer,
				TaskRegionVisualizer
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
				OpenLayersStaticImageSourceProvider
			]
		})
	]
})
export class OpenlayersPluginsModule {

}
