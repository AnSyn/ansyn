import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnsynComponent } from './ansyn/ansyn.component';
import { StatusBarModule } from '@ansyn/status-bar';
import { OverlaysModule } from '@ansyn/overlays';
import { AnsynPluginsModule } from '@ansyn/plugins';
import { AppProvidersModule } from './app-providers/app-providers.module';
import { AppEffectsModule } from './app-effects/app.effects.module';
import {
	TasksModule,
	CasesModule,
	FiltersModule,
	HelpModule,
	LayersManagerModule,
	SettingsModule,
	ToolsModule, TasksRemoteDefaultService
} from '@ansyn/menu-items';
import { MenuModule } from '@ansyn/menu';
import { MapFacadeModule } from '@ansyn/map-facade';
import { ImageryModule } from '@ansyn/imagery';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AlertsModule, CoreModule } from '@ansyn/core';
import { DefaultUrlSerializer, RouterModule, UrlSerializer } from '@angular/router';
import { ansynConfig } from './config/ansyn.config';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { COMPONENT_MODE } from './app-providers/component-mode';
import { OverlayOutOfBoundsComponent } from './components/overlay-out-of-bounds/overlay-out-of-bounds.component';
import { ANSYN_ID } from './api/ansyn-id.provider';

@NgModule({
	imports: [
		CommonModule,
		StoreModule.forRoot({}),
		EffectsModule.forRoot([]),
		AppProvidersModule,
		CasesModule,
		FiltersModule,
		LayersManagerModule,
		ToolsModule,
		TasksModule.provideRemote(TasksRemoteDefaultService),
		SettingsModule,
		OverlaysModule,
		FormsModule,
		HttpClientModule,
		BrowserAnimationsModule,
		AnsynPluginsModule,
		CoreModule,
		MenuModule.provideMenuItems(ansynConfig.ansynMenuItems),
		AlertsModule.provideAlerts(ansynConfig.ansynAlerts),
		AppEffectsModule,
		MapFacadeModule,
		ImageryModule,
		StatusBarModule,
		RouterModule,
		HelpModule
	],
	providers: [
		{
			provide: ANSYN_ID,
			useValue: -1
		},
		{
			provide: COMPONENT_MODE,
			useValue: false
		},
		{ provide: UrlSerializer, useClass: DefaultUrlSerializer }
	],
	entryComponents: [
		OverlayOutOfBoundsComponent
	],
	declarations: [
		AnsynComponent,
		OverlayOutOfBoundsComponent
	],
	exports: [AnsynComponent]
})

export class AnsynModule {
	static component(id?: string): ModuleWithProviders {
		return {
			ngModule: AnsynModule,
			providers: [
				{
					provide: COMPONENT_MODE,
					useValue: true
				},
				{
					provide: ANSYN_ID,
					useValue: id
				}
			]
		}
	}
}
