import { BaseOverlaySourceProvider } from '@ansyn/overlays';
import {
	IdahoOverlaysSourceConfig,
	IdahoSourceProvider,
	IIdahoOverlaySourceConfig
} from './overlay-source-providers/idaho-source-provider';
import { OpenLayerBingSourceProvider } from './map-source-providers/open-layers-BING-source-provider';
import { OpenLayerIDAHOSourceProvider } from './map-source-providers/open-layers-IDAHO-source-provider';
import { OpenLayerOSMSourceProvider } from './map-source-providers/open-layers-OSM-source-provider';
import { OpenLayerTileWMSSourceProvider } from './map-source-providers/open-layers-TileWMS-source-provider';
import { OpenLayerMapBoxSourceProvider } from './map-source-providers/open-layers-MapBox-source-provider';
import { OpenLayerESRI4326SourceProvider } from './map-source-providers/open-layers-ESRI-4326-source-provider';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { BaseMapSourceProvider } from '@ansyn/imagery';
import { BaseContextSourceProvider } from '@ansyn/context/context.interface';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { ContextProxySourceService } from './context-source-providers/context-proxy-source.service';
import { OpenLayersVisualizerMapType } from '@ansyn/open-layer-visualizers/open-layer-visualizers.module';
import { FootprintPolygonVisualizer } from '@ansyn/open-layer-visualizers/overlays/polygon-visualizer';
import { ContextEntityVisualizer } from './app-visualizers/context-entity.visualizer';
import { FootprintHeatmapVisualizer } from '@ansyn/open-layer-visualizers/overlays/heatmap-visualizer';
import { FootprintPolylineVisualizer } from '@ansyn/open-layer-visualizers/overlays/polyline-visualizer';
import { AnnotationsVisualizer } from '@ansyn/open-layer-visualizers/annotations.visualizer';
import { MeasureDistanceVisualizer } from '@ansyn/open-layer-visualizers';
import { GoToVisualizer } from '@ansyn/open-layer-visualizers/tools/goto.visualizer';
import { MapVisualizer } from '@ansyn/imagery/model/imap-visualizer.token';
import { IconVisualizer } from '@ansyn/open-layer-visualizers/icon.visualizer';
import { FilterMetadata } from '@ansyn/menu-items/filters/models/metadata/filter-metadata.interface';
import { EnumFilterMetadata, SliderFilterMetadata } from '@ansyn/menu-items/filters';
import { MouseShadowVisualizer } from '@ansyn/open-layer-visualizers/mouse-shadow.visualizer';
import {
	MultipleOverlaysSource,
	MultipleOverlaysSourceProvider
} from './overlay-source-providers/multiple-source-provider';
import { IdahoSourceProvider2 } from './overlay-source-providers/idaho-source-provider2';
import { OpenLayerIDAHO2SourceProvider } from './map-source-providers/open-layers-IDAHO2-source-provider';

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

		// Source provider for contexts
		{ provide: BaseContextSourceProvider, useClass: ContextProxySourceService },

		// Map tiling source providers
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
		}, {
			provide: MapVisualizer,
			multi: true,
			useValue: {
				type: OpenLayersVisualizerMapType,
				visualizer: FootprintHeatmapVisualizer
			}
		}, {
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
		{ provide: FilterMetadata, useClass: SliderFilterMetadata, multi: true }

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

