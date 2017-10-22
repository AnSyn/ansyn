import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ansynMenuItems } from './ansyn.menu-items';
import { AnsynComponent } from './ansyn/ansyn.component';
import { CaseComponent } from './case/case.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '@ansyn/core';
import { MenuModule } from '@ansyn/menu';
import { ImageryModule } from '@ansyn/imagery';
import { OpenLayerMapModule } from '@ansyn/open-layers-map';
import { MapFacadeModule } from '@ansyn/map-facade';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StatusBarModule } from '@ansyn/status-bar/status-bar.module';
import { OpenLayerCenterMarkerPluginModule } from '@ansyn/open-layer-center-marker-plugin';
import { ContextModule } from '@ansyn/context';
import { AppProvidersModule } from '../app-providers/app-providers.module';
import { AppReducersModule } from '../app-reducers/app-reducers.module';
import {
	AlgorithmsModule,
	CasesModule,
	FiltersModule,
	ImagerySandBoxModule,
	LayersManagerModule,
	SettingsModule,
	ToolsModule
} from '@ansyn/menu-items';
import { OverlaysModule } from '@ansyn/overlays/overlays.module';
import { AnsynRouterModule } from '@ansyn/router';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
	imports: [
		CasesModule,
		OverlaysModule,
		CommonModule,
		AppProvidersModule,
		OpenLayerCenterMarkerPluginModule,
		OpenLayerMapModule,
		BrowserModule,
		FormsModule,
		HttpClientModule,
		ContextModule,
		BrowserAnimationsModule,
		CoreModule,
		MenuModule.provideMenuItems(ansynMenuItems),
		FiltersModule,
		LayersManagerModule,
		ToolsModule,
		AlgorithmsModule,
		SettingsModule,
		ImagerySandBoxModule,
		// Do not change order AppReducer depends on the above
		AppReducersModule,
		MapFacadeModule,
		ImageryModule,
		StatusBarModule,
		ContextModule,
		AnsynRouterModule,
		RouterModule
	],
	declarations: [AnsynComponent, CaseComponent]
})

export class AnsynModule {
}
