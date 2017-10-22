import { NgModule } from '@angular/core';
import { ImageryModule, ImageryProviderService } from '@ansyn/imagery';
import { FootprintPolygonVisualizer } from './overlays/polygon-visualizer';
import { FootprintHitmapVisualizer } from './overlays/hitmap-visualizer';
import { FootprintPolylineVisualizer } from './overlays/polyline-visualizer';
import { AnnotationsVisualizer } from './annotations.visualizer';
import { GoToVisualizer } from './tools/goto.visualizer';

export const OpenLayersVisualizerMapType = 'openLayersMap';

@NgModule({
	imports: [ImageryModule],
	declarations: [],
	providers: [],
	exports: [],
	entryComponents: []
})
export class OpenLayerVisualizersModule {
	constructor(imageryProviderService: ImageryProviderService) {
		imageryProviderService.registerVisualizer(OpenLayersVisualizerMapType, FootprintPolygonVisualizer);
		imageryProviderService.registerVisualizer(OpenLayersVisualizerMapType, FootprintHitmapVisualizer);
		imageryProviderService.registerVisualizer(OpenLayersVisualizerMapType, FootprintPolylineVisualizer);
		imageryProviderService.registerVisualizer(OpenLayersVisualizerMapType, AnnotationsVisualizer);
		imageryProviderService.registerVisualizer(OpenLayersVisualizerMapType, GoToVisualizer);
	}
}
