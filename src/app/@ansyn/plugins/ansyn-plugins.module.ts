import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageryModule } from '@ansyn/imagery';
import { NorthCalculationsPlugin } from './openlayers/plugins/north-calculations/north-calculations.plugin';
import { OpenlayersOsmLayersPlugin } from './openlayers/plugins/layers/openlayers-osm-layers.plugin';
import { CenterMarkerPlugin } from './openlayers/plugins/center-marker/center-marker.plugin';
import { ImageProcessingPlugin } from './openlayers/plugins/image-processing/image-processing.plugin';
import { ContextMenuPlugin } from './openlayers/plugins/context-menu/context-menu.plugin';
import { MonitorPlugin } from './openlayers/plugins/monitor/monitor.plugin';
import { FrameVisualizer } from './openlayers/plugins/visualizers/overlays/frame-visualizer';
import { MeasureDistanceVisualizer } from './openlayers/plugins/visualizers/tools/measure-distance.visualizer';
import { AnnotationsVisualizer } from './openlayers/plugins/visualizers/tools/annotations.visualizer';
import { ContextEntityVisualizer } from './openlayers/plugins/visualizers/contexts/context-entity.visualizer';
import { FootprintPolylineVisualizer } from './openlayers/plugins/visualizers/overlays/polyline-visualizer';
import { FootprintHeatmapVisualizer } from './openlayers/plugins/visualizers/overlays/heatmap-visualizer';
import { GoToVisualizer } from './openlayers/plugins/visualizers/tools/goto.visualizer';
import { PinPointVisualizer } from './openlayers/plugins/visualizers/region/pin-point.visualizer';
import { OpenLayersMap } from './openlayers/mapSourceProviders/open-layers-map/openlayers-map/openlayers-map';
import { CesiumMap } from './cesium/maps/cesium-map/cesium-map';
import { OpenLayersDisabledMap } from './openlayers/mapSourceProviders/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';
import { OpenlayersGeoJsonLayersVisualizer } from './openlayers/plugins/layers/openlayers-geoJson-layers.visualizer';
import { PolygonSearchVisualizer } from './openlayers/plugins/visualizers/region/polygon-search.visualizer';
import { MouseShadowVisualizer } from './openlayers/plugins/visualizers/tools/mouse-shadow.visualizer';
import { AlertsPlugin } from './openlayers/plugins/alerts/alerts.plugin';
import { TaskRegionVisualizer } from './openlayers/plugins/visualizers/algorithms/task-region.visualizer';
import { OpenLayerTileWMSSourceProvider } from './openlayers/maps/open-layers-TileWMS-source-provider';
import { OpenLayerMapBoxSourceProvider } from './openlayers/maps/open-layers-MapBox-source-provider';
import { OpenLayerOSMSourceProvider } from './openlayers/maps/open-layers-OSM-source-provider';
import { OpenLayerIDAHOSourceProvider } from './openlayers/maps/open-layers-IDAHO-source-provider';
import { OpenLayerPlanetSourceProvider } from './openlayers/maps/open-layers-planet-source-provider';
import { OpenLayerBingSourceProvider } from './openlayers/maps/open-layers-BING-source-provider';
import { OpenLayerESRI4326SourceProvider } from './openlayers/maps/open-layers-ESRI-4326-source-provider';
import { OpenLayerOpenAerialSourceProvider } from './openlayers/maps/open-layers-open-aerial-source-provider';

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
			maps: [OpenLayersMap, OpenLayersDisabledMap, CesiumMap],
			mapSourceProviders: [
				OpenLayerTileWMSSourceProvider,
				OpenLayerMapBoxSourceProvider,
				OpenLayerOSMSourceProvider,
				OpenLayerIDAHOSourceProvider,
				OpenLayerPlanetSourceProvider,
				OpenLayerBingSourceProvider,
				OpenLayerESRI4326SourceProvider,
				OpenLayerOpenAerialSourceProvider
			]
		})
	]
})
export class AnsynPluginsModule {

}
