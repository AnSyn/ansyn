import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ansynMenuItems } from './ansyn.menu-items';
import { AnsynComponent } from './ansyn/ansyn.component';

import { FormsModule } from '@angular/forms';
import { CoreModule } from '@ansyn/core';
import { MenuModule } from '@ansyn/menu';
import { ImageryModule } from '@ansyn/imagery';
import { MapFacadeModule } from '@ansyn/map-facade';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StatusBarModule } from '@ansyn/status-bar/status-bar.module';
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
import { AnsynPluginsModule } from '@ansyn/plugins/ansyn-plugins.module';
import { AppProvidersModule } from './app-providers/app-providers.module';
import { AppEffectsModule } from './app-effects/app.effects.module';

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
		FormsModule,
		HttpClientModule,
		BrowserAnimationsModule,
		AnsynPluginsModule,
		CoreModule,
		MenuModule.provideMenuItems(ansynMenuItems),
		AppEffectsModule,
		MapFacadeModule,
		ImageryModule,
		StatusBarModule,
		AnsynRouterModule
	],
	declarations: [AnsynComponent],
	exports: [AnsynComponent]
})

export class AnsynModule {
}
