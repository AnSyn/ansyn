import { PinPointVisualizer } from '@ansyn/plugins/openlayers/visualizers/region/pin-point.visualizer';
import { ContextEntityVisualizer } from '@ansyn/ansyn/app-providers/app-visualizers/context-entity.visualizer';
import { AnnotationsVisualizer } from '@ansyn/plugins/openlayers/visualizers/tools/annotations.visualizer';
import { FootprintPolylineVisualizer } from '@ansyn/plugins/openlayers/visualizers/overlays/polyline-visualizer';
import { GoToVisualizer } from '@ansyn/plugins/openlayers/visualizers/tools/goto.visualizer';
import { MouseShadowVisualizer } from '@ansyn/plugins/openlayers/visualizers/tools/mouse-shadow.visualizer';
import { FrameVisualizer } from '@ansyn/plugins/openlayers/visualizers/overlays/frame-visualizer';
import { FootprintHeatmapVisualizer } from '@ansyn/plugins/openlayers/visualizers/overlays/heatmap-visualizer';
import { BaseImageryPluginClass } from '@ansyn/imagery/model/plugins-collection';
import { PolygonSearchVisualizer } from '@ansyn/plugins/openlayers/visualizers/region/polygon-search.visualizer';
import { MeasureDistanceVisualizer } from '@ansyn/plugins/openlayers/visualizers/tools/measure-distance.visualizer';

export const VisualizersProviders: BaseImageryPluginClass[] = [
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
];
