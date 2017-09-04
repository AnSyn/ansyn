import { FilterMetadata, EnumFilterMetadata } from '@ansyn/menu-items/filters';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { CoreModule } from '@ansyn/core';
import { MenuModule } from '@ansyn/menu';
import { ImageryModule, ImageryProviderService } from '@ansyn/imagery';
import { OpenLayerMapModule } from '@ansyn/open-layers-map';
import { OverlaysModule } from '@ansyn/overlays';
import { MapFacadeModule } from '@ansyn/map-facade';
import { ImagerySandBoxModule } from '@ansyn/menu-items/imagerySandBox';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRouter } from './app-routing.module';
import { AnsynComponent } from './ansyn/ansyn.component';
import { StatusBarModule } from '@ansyn/status-bar/status-bar.module';
import { OpenLayerCenterMarkerPluginModule } from '@ansyn/open-layer-center-marker-plugin';
import { ContextModule } from '@ansyn/context/context.module';
import { AppProvidersModule } from "./app-providers/app-providers.module";
import { AppReducersModule } from './app-reducers/app-reducers.module';
import { OpenLayerVisualizersModule, OpenLayersVisualizerMapType } from '@ansyn/open-layer-visualizers';
import { ContextElasticSource } from '@ansyn/context/';
import { ContextProxySource } from '@ansyn/context';
import { ContextEntityVisualizer } from './app-visualizers/context-entity.visualizer';
import { CasesModule, FiltersModule, LayersManagerModule, ToolsModule, AlgorithmsModule, SettingsModule } from "@ansyn/menu-items";
import { LoginModule } from './packages/login/login.module';

export const contextSources = {
	 'Proxy': ContextProxySource,
	 "Elastic": ContextElasticSource
 };

@NgModule({
	providers: [
		{ provide: FilterMetadata, useClass:EnumFilterMetadata, multi: true }
	],
	declarations: [
		AppComponent,
		AnsynComponent
	],
	imports: [
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
		LoginModule,
		CasesModule,
		FiltersModule,
		LayersManagerModule,
		ToolsModule,
		AlgorithmsModule,
		SettingsModule,
		OverlaysModule,
		AppRouter,
		AppReducersModule,
		ImagerySandBoxModule,
		MapFacadeModule,
		ImageryModule,
		StatusBarModule,
		ContextModule,
		OpenLayerVisualizersModule
	],
	bootstrap: [AppComponent]
})

export class AppModule {
	constructor(imageryProviderService: ImageryProviderService) {
		imageryProviderService.registerVisualizer(OpenLayersVisualizerMapType, ContextEntityVisualizer);
	}
}
