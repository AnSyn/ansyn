import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ansynMenuItems } from './ansyn.menu-items';
import { AnsynComponent } from './ansyn/ansyn.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '@ansyn/core';
import { MenuModule } from '@ansyn/menu';
import { ImageryModule } from '@ansyn/imagery';
import { OpenLayersMapModule } from '@ansyn/open-layers-map';
import { MapFacadeModule } from '@ansyn/map-facade';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StatusBarModule } from '@ansyn/status-bar/status-bar.module';
import { OpenLayerCenterMarkerPluginModule } from '@ansyn/open-layer-center-marker-plugin';
import { OpenLayersNorthCalculationsModule } from '@ansyn/open-layers-north-calculations';
import { ContextModule } from '@ansyn/context';
import { AppProvidersModule } from '../app-providers/app-providers.module';
import { AppEffectsModule } from '../app-effects/app.effects.module';
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
import { HttpClientModule } from '@angular/common/http';

const MenuItemsModules = [
	CasesModule,
	FiltersModule,
	LayersManagerModule,
	ToolsModule,
	AlgorithmsModule,
	SettingsModule,
	ImagerySandBoxModule
];

@NgModule({
	imports: [
		CommonModule,
		AppProvidersModule,
		...MenuItemsModules,
		OverlaysModule,
		OpenLayerCenterMarkerPluginModule,
		OpenLayersNorthCalculationsModule,
		OpenLayersMapModule,
		BrowserModule,
		FormsModule,
		HttpClientModule,
		ContextModule,
		BrowserAnimationsModule,
		CoreModule,
		MenuModule.provideMenuItems(ansynMenuItems),
		AppEffectsModule,
		MapFacadeModule,
		ImageryModule,
		StatusBarModule,
		AnsynRouterModule
	],
	declarations: [AnsynComponent]
})

export class AnsynModule {
}
