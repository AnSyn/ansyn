import { IconVisualizer } from '@ansyn/plugins/openlayers/visualizers/region/pin-point.visualizer';
import { ContextEntityVisualizer } from '@ansyn/ansyn/app-providers/app-visualizers/context-entity.visualizer';
import { BaseImageryPlugin } from '@ansyn/imagery';
import { AnnotationsVisualizer } from '@ansyn/plugins/openlayers/visualizers/tools/annotations.visualizer';
import { FootprintPolylineVisualizer } from '@ansyn/plugins/openlayers/visualizers/overlays/polyline-visualizer';
import { GoToVisualizer } from '@ansyn/plugins/openlayers/visualizers/tools/goto.visualizer';
import { VisualizersConfig } from '@ansyn/core/tokens/visualizers-config.token';
import { MouseShadowVisualizer } from '@ansyn/plugins/openlayers/visualizers/tools/mouse-shadow.visualizer';
import { MeasureDistanceVisualizer } from '@ansyn/plugins/openlayers/visualizers/index';
import { FrameVisualizer } from '@ansyn/plugins/openlayers/visualizers/overlays/frame-visualizer';
import { FootprintHeatmapVisualizer } from '@ansyn/plugins/openlayers/visualizers/overlays/heatmap-visualizer';
import { ImageryPluginProvider } from '@ansyn/imagery/model/plugins-collection';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { PolygonSearchVisualizer } from "@ansyn/plugins/openlayers/visualizers/region/polygon-search.visualizer";
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';

export const VisualizersProviders: ImageryPluginProvider[] = [
	{
		provide: BaseImageryPlugin,
		useClass: ContextEntityVisualizer,
		multi: true,
		deps: []
	},
	{
		provide: BaseImageryPlugin,
		multi: true,
		useClass: FootprintHeatmapVisualizer,
		deps: [Store, Actions]
	},
	{
		provide: BaseImageryPlugin,
		multi: true,
		useClass: FrameVisualizer,
		deps: [Store, Actions, VisualizersConfig]
	},
	{
		provide: BaseImageryPlugin,
		multi: true,
		useClass: FootprintPolylineVisualizer,
		deps: [Store, Actions, VisualizersConfig]
	},
	{
		provide: BaseImageryPlugin,
		multi: true,
		useClass: AnnotationsVisualizer,
		deps: [Store]
	},
	{
		provide: BaseImageryPlugin,
		multi: true,
		useClass: MeasureDistanceVisualizer,
		deps: [Actions, Store]
	},
	{
		provide: BaseImageryPlugin,
		multi: true,
		useClass: GoToVisualizer,
		deps: [Store]
	},
	{
		provide: BaseImageryPlugin,
		multi: true,
		useClass: IconVisualizer,
		deps: [Store, Actions, ProjectionService]
	},
	{
		provide: BaseImageryPlugin,
		multi: true,
		useClass: MouseShadowVisualizer,
		deps: []
	},
	{
		provide: BaseImageryPlugin,
		multi: true,
		useClass: PolygonSearchVisualizer,
		deps: [Store, Actions, VisualizersConfig]
	}
];
