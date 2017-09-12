/**
 * Created by AsafMas on 07/05/2017.
 */
import { NgModule } from '@angular/core';
import { ImageryModule, ImageryProviderService } from '@ansyn/imagery';
import { FootprintPolygonVisualizer } from './overlays/polygon-visualizer';
import { FootprintHitmapVisualizer } from './overlays/hitmap-visualizer';
import { FootprintPolylineVisualizer, FootprintPolylineVisualizerType } from './overlays/polyline-visualizer';
import { AnnotationsVisualizer } from './annotations.visualizer';

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
	}
}
