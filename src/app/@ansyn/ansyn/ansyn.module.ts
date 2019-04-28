import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnsynComponent } from './ansyn/ansyn.component';
import { AppProvidersModule } from './app-providers/app-providers.module';
import { AppEffectsModule } from './app-effects/app.effects.module';
import { MenuModule } from '@ansyn/menu';
import { MapFacadeModule } from '@ansyn/map-facade';
import { ImageryModule } from '@ansyn/imagery';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AlertsModule } from '@ansyn/map-facade';
import { DefaultUrlSerializer, RouterModule, UrlSerializer } from '@angular/router';
import { ansynConfig } from './config/ansyn.config';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { COMPONENT_MODE } from './app-providers/component-mode';
import { OverlayOutOfBoundsComponent } from './components/overlay-out-of-bounds/overlay-out-of-bounds.component';
import { ANSYN_ID } from './api/ansyn-id.provider';
import { CoreModule } from './modules/core/core.module';
import { CasesModule } from './modules/menu-items/cases/cases.module';
import { FiltersModule } from './modules/menu-items/filters/filters.module';
import { LayersManagerModule } from './modules/menu-items/layers-manager/layers-manager.module';
import { TasksModule } from './modules/menu-items/algorithms/tasks.module';
import { SettingsModule } from './modules/menu-items/settings/settings.module';
import { OverlaysModule } from './modules/overlays/overlays.module';
import { TasksRemoteDefaultService } from './modules/menu-items/algorithms/services/tasks-remote-default.service';
import { AnsynPluginsModule } from './modules/plugins/ansyn-plugins.module';
import { StatusBarModule } from './modules/status-bar/status-bar.module';
import { HelpModule } from './modules/menu-items/help/help.module';
import { ToolsModule } from './modules/menu-items/tools/tools.module';
import { AnnotationContextMenuComponent } from '../ol/plugins/annotations/annotations-context-menu/annotation-context-menu/annotation-context-menu.component';
import { UnsupportedDevicesComponent } from './components/unsupported-devices/unsupported-devices.component';

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
		MapFacadeModule.provide({
			entryComponents: [AnnotationContextMenuComponent]
		}),
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
		OverlayOutOfBoundsComponent,
		UnsupportedDevicesComponent,
	],
	exports: [ AnsynComponent, UnsupportedDevicesComponent ]
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
		};
	}
}
