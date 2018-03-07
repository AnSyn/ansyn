import { BaseOverlaySourceProvider } from '@ansyn/overlays';
import {
	IdahoSourceProvider2,
	MultipleOverlaysSource,
	MultipleOverlaysSourceProvider,
	IdahoOverlaysSourceConfig,
	IdahoSourceProvider,
	IIdahoOverlaySourceConfig
} from './overlay-source-providers';
import {
	OpenLayerBingSourceProvider,
	OpenLayerIDAHOSourceProvider,
	OpenLayerIDAHO2SourceProvider,
	OpenLayerOSMSourceProvider,
	OpenLayerTileWMSSourceProvider,
	OpenLayerMapBoxSourceProvider,
	OpenLayerESRI4326SourceProvider
} from './map-source-providers';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { BaseMapSourceProvider } from '@ansyn/imagery';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { OpenLayersVisualizerMapType } from '@ansyn/plugins/openlayers/open-layer-visualizers/open-layer-visualizers-map-type.model';
import { FootprintPolygonVisualizer } from '@ansyn/plugins/openlayers/open-layer-visualizers/overlays/polygon-visualizer';
import { ContextEntityVisualizer } from './app-visualizers/context-entity.visualizer';
import { FootprintHeatmapVisualizer } from '@ansyn/plugins/openlayers/open-layer-visualizers/overlays/heatmap-visualizer';
import { FootprintPolylineVisualizer } from '@ansyn/plugins/openlayers/open-layer-visualizers/overlays/polyline-visualizer';
import { AnnotationsVisualizer } from '@ansyn/plugins/openlayers/open-layer-visualizers/annotations.visualizer';
import { MeasureDistanceVisualizer } from '@ansyn/plugins/openlayers/open-layer-visualizers';
import { GoToVisualizer } from '@ansyn/plugins/openlayers/open-layer-visualizers/tools/goto.visualizer';
import { MapVisualizer } from '@ansyn/imagery/model/imap-visualizer.token';
import { IconVisualizer } from '@ansyn/plugins/openlayers/open-layer-visualizers/icon.visualizer';
import { FilterMetadata } from '@ansyn/menu-items/filters/models/metadata/filter-metadata.interface';
import { EnumFilterMetadata, SliderFilterMetadata } from '@ansyn/menu-items/filters';
import { MouseShadowVisualizer } from '@ansyn/plugins/openlayers/open-layer-visualizers/mouse-shadow.visualizer';
import { BooleanFilterMetadata } from '@ansyn/menu-items/filters/models/metadata/boolean-filter-metadata';
import { FrameVisualizer, FrameVisualizerType } from '@ansyn/open-layer-visualizers/overlays/frame-visualizer';
import { OpenLayersProjectionService } from '@ansyn/open-layers-map';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';

@NgModule({
	imports: [
		BrowserModule,
		HttpClientModule
	],
	providers: [
		// Source provider for overlays
		{ provide: BaseOverlaySourceProvider, useClass: MultipleOverlaysSourceProvider },

		{ provide: MultipleOverlaysSource, useClass: IdahoSourceProvider, multi: true },
		{ provide: MultipleOverlaysSource, useClass: IdahoSourceProvider2, multi: true },

		// Map tiling source services
		{ provide: BaseMapSourceProvider, useClass: OpenLayerTileWMSSourceProvider, multi: true },
		{ provide: BaseMapSourceProvider, useClass: OpenLayerMapBoxSourceProvider, multi: true },
		{ provide: BaseMapSourceProvider, useClass: OpenLayerOSMSourceProvider, multi: true },
		{ provide: BaseMapSourceProvider, useClass: OpenLayerIDAHOSourceProvider, multi: true },
		{ provide: BaseMapSourceProvider, useClass: OpenLayerIDAHO2SourceProvider, multi: true },
		{ provide: BaseMapSourceProvider, useClass: OpenLayerBingSourceProvider, multi: true },
		{ provide: BaseMapSourceProvider, useClass: OpenLayerESRI4326SourceProvider, multi: true },

		// Map visualizers
		{
			provide: MapVisualizer,
			multi: true,
			useValue: {
				type: OpenLayersVisualizerMapType,
				visualizer: ContextEntityVisualizer
			}
		}, {
			provide: MapVisualizer,
			multi: true,
			useValue: {
				type: OpenLayersVisualizerMapType,
				visualizer: FootprintPolygonVisualizer
			}
		},
		{
			provide: MapVisualizer,
			multi: true,
			useValue: {
				type: OpenLayersVisualizerMapType,
				visualizer: FootprintHeatmapVisualizer
			}
		},
		{
			provide: MapVisualizer,
			multi: true,
			useValue: {
				type: OpenLayersVisualizerMapType,
				visualizer: FrameVisualizer
			}
		},
		{
			provide: MapVisualizer,
			multi: true,
			useValue: {
				type: OpenLayersVisualizerMapType,
				visualizer: FootprintPolylineVisualizer
			}
		}, {
			provide: MapVisualizer,
			multi: true,
			useValue: {
				type: OpenLayersVisualizerMapType,
				visualizer: AnnotationsVisualizer
			}
		}, {
			provide: MapVisualizer,
			multi: true,
			useValue: {
				type: OpenLayersVisualizerMapType,
				visualizer: MeasureDistanceVisualizer
			}
		}, {
			provide: MapVisualizer,
			multi: true,
			useValue: {
				type: OpenLayersVisualizerMapType,
				visualizer: GoToVisualizer
			}
		}, {
			provide: MapVisualizer,
			multi: true,
			useValue: {
				type: OpenLayersVisualizerMapType,
				visualizer: IconVisualizer
			}
		}, {
			provide: MapVisualizer,
			multi: true,
			useValue: {
				type: OpenLayersVisualizerMapType,
				visualizer: MouseShadowVisualizer
			}
		},
		// Source provider for filters
		{ provide: FilterMetadata, useClass: EnumFilterMetadata, multi: true },
		{ provide: FilterMetadata, useClass: SliderFilterMetadata, multi: true },
		{ provide: FilterMetadata, useClass: BooleanFilterMetadata, multi: true },

		{ provide: ProjectionService, useClass: OpenLayersProjectionService }
	]
})
export class AppProvidersModule {
	static forRoot(idahoOverlaySourceConfig: IIdahoOverlaySourceConfig): ModuleWithProviders {
		return {
			ngModule: AppProvidersModule,
			providers: [
				{ provide: IdahoOverlaysSourceConfig, useValue: idahoOverlaySourceConfig }
			]
		};
	}
}

