import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnsynComponent } from './ansyn/ansyn.component';
import { CaseComponent } from './case/case.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { CoreModule } from '@ansyn/core';
import { MenuModule } from '@ansyn/menu';
import { ImageryModule } from '@ansyn/imagery';
import { OpenLayerMapModule } from '@ansyn/open-layers-map';
import { MapFacadeModule } from '@ansyn/map-facade';
import { ImagerySandBoxModule } from '@ansyn/menu-items/imagerySandBox';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StatusBarModule } from '@ansyn/status-bar/status-bar.module';
import { OpenLayerCenterMarkerPluginModule } from '@ansyn/open-layer-center-marker-plugin';
import { ContextModule } from '@ansyn/context/context.module';
import { AppProvidersModule } from '../app-providers/app-providers.module';
import { AppReducersModule } from '../app-reducers/app-reducers.module';
import { OpenLayerVisualizersModule } from '@ansyn/open-layer-visualizers';
import { ContextElasticSource } from '@ansyn/context/';
import { ContextEntityVisualizer } from '../app-visualizers/context-entity.visualizer';
import {
	CasesModule,
	FiltersModule,
	LayersManagerModule,
	ToolsModule,
	AlgorithmsModule,
	SettingsModule
} from '@ansyn/menu-items';
import { OverlaysModule } from '@ansyn/overlays/overlays.module';
import { ImageryProviderService } from '@ansyn/imagery/provider-service/provider.service';
import { OpenLayersVisualizerMapType } from '@ansyn/open-layer-visualizers/open-layer-visualizers.module';
import { AnsynRouterModule } from '@ansyn/router';
import { RouterModule } from '@angular/router';

@NgModule({
	imports: [
		CommonModule,
		AppProvidersModule,
		OpenLayerCenterMarkerPluginModule,
		OpenLayerMapModule,
		BrowserModule,
		FormsModule,
		HttpModule,
		ContextModule,
		BrowserAnimationsModule,
		CoreModule,
		MenuModule,
		OverlaysModule,
		CasesModule,
		FiltersModule,
		LayersManagerModule,
		ToolsModule,
		AlgorithmsModule,
		SettingsModule,
		AppReducersModule,
		ImagerySandBoxModule,
		MapFacadeModule,
		ImageryModule,
		StatusBarModule,
		ContextModule,
		OpenLayerVisualizersModule,
		AnsynRouterModule,
		RouterModule
	],
	declarations: [AnsynComponent, CaseComponent]
})

export class AnsynModule {
	constructor(imageryProviderService: ImageryProviderService) {
		imageryProviderService.registerVisualizer(OpenLayersVisualizerMapType, ContextEntityVisualizer);
	}
}
