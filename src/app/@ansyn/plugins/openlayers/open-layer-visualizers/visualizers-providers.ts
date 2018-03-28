import { IconVisualizer } from '@ansyn/plugins/openlayers/open-layer-visualizers/icon.visualizer';
import { ContextEntityVisualizer } from '@ansyn/ansyn/app-providers/app-visualizers/context-entity.visualizer';
import { BaseImageryPlugin } from '@ansyn/imagery';
import { AnnotationsVisualizer } from '@ansyn/plugins/openlayers/open-layer-visualizers/tools/annotations.visualizer';
import { FootprintPolylineVisualizer } from '@ansyn/plugins/openlayers/open-layer-visualizers/overlays/polyline-visualizer';
import { GoToVisualizer } from '@ansyn/plugins/openlayers/open-layer-visualizers/tools/goto.visualizer';
import { VisualizersConfig } from '@ansyn/core/tokens/visualizers-config.token';
import { MouseShadowVisualizer } from '@ansyn/plugins/openlayers/open-layer-visualizers/tools/mouse-shadow.visualizer';
import { MeasureDistanceVisualizer } from '@ansyn/plugins/openlayers/open-layer-visualizers/index';
import { FrameVisualizer } from '@ansyn/plugins/openlayers/open-layer-visualizers/overlays/frame-visualizer';
import { FootprintHeatmapVisualizer } from '@ansyn/plugins/openlayers/open-layer-visualizers/overlays/heatmap-visualizer';
import { ImageryPluginProvider } from '@ansyn/imagery/model/plugins-collection';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';

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
		deps: [Store, Actions]
	},
	{
		provide: BaseImageryPlugin,
		multi: true,
		useClass: MeasureDistanceVisualizer,
		deps: []
	},
	{
		provide: BaseImageryPlugin,
		multi: true,
		useClass: GoToVisualizer,
		deps: []
	},
	{
		provide: BaseImageryPlugin,
		multi: true,
		useClass: IconVisualizer,
		deps: []
	},
	{
		provide: BaseImageryPlugin,
		multi: true,
		useClass: MouseShadowVisualizer,
		deps: []
	}
];
