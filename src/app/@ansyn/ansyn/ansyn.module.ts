import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnsynComponent } from './ansyn/ansyn.component';
import { StatusBarModule } from '@ansyn/status-bar';
import { OverlaysModule } from '@ansyn/overlays/overlays.module';
import { AnsynPluginsModule } from '@ansyn/plugins/ansyn-plugins.module';
import { AppProvidersModule } from './app-providers/app-providers.module';
import { AppEffectsModule } from './app-effects/app.effects.module';
import { AlertsModule } from '@ansyn/core/alerts/alerts.module';
import {
	AlgorithmsModule,
	CasesModule,
	FiltersModule,
	HelpModule,
	LayersManagerModule,
	SettingsModule,
	ToolsModule
} from '@ansyn/menu-items';
import { MenuModule } from '@ansyn/menu';
import { MapFacadeModule } from '@ansyn/map-facade';
import { ImageryModule } from '@ansyn/imagery';
import { ContextModule } from '@ansyn/context/context.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from '@ansyn/core';
import { RouterModule } from '@angular/router';
import { configuration } from '../../../configuration/configuration';
import { ansynAlerts } from './ansyn-alerts';

@NgModule({
	imports: [
		CommonModule,
		AppProvidersModule,
		CasesModule,
		FiltersModule,
		LayersManagerModule,
		ToolsModule,
		AlgorithmsModule,
		SettingsModule,
		OverlaysModule,
		FormsModule,
		HttpClientModule,
		BrowserAnimationsModule,
		AnsynPluginsModule,
		CoreModule,
		ContextModule,
		MenuModule.provideMenuItems(configuration.ansynMenuItems),
		AlertsModule.provideAlerts(ansynAlerts),
		AppEffectsModule,
		MapFacadeModule,
		ImageryModule,
		StatusBarModule,
		RouterModule,
		HelpModule
	],
	declarations: [AnsynComponent],
	exports: [AnsynComponent]
})

export class AnsynModule {


}
