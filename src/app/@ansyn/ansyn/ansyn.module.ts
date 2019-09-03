import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertsModule } from './modules/alerts/alerts.module';
import { DefaultUrlSerializer, RouterModule, UrlSerializer } from '@angular/router';
import { ImageryModule } from '@ansyn/imagery';
import { MapFacadeModule } from '@ansyn/map-facade';
import { MenuModule } from '@ansyn/menu';
import { AnnotationContextMenuComponent } from '@ansyn/ol';
import { AnsynComponent } from './ansyn/ansyn.component';
import { ANSYN_ID } from './api/ansyn-id.provider';
import { AppEffectsModule } from './app-effects/app.effects.module';
import { AppProvidersModule } from './app-providers/app-providers.module';
import { COMPONENT_MODE } from './app-providers/component-mode';
import { AnsynFooterComponent } from './components/ansyn-footer/ansyn-footer.component';
import { OverlayOutOfBoundsComponent } from './components/overlay-out-of-bounds/overlay-out-of-bounds.component';
import { UnsupportedDevicesComponent } from './components/unsupported-devices/unsupported-devices.component';
import { ansynConfig } from './config/ansyn.config';
import { AngleFilterComponent } from './modules/core/components/angle-filter/angle-filter.component';
import { CoreModule } from './modules/core/core.module';
import { AnsynTranslationModule } from './modules/core/translation/ansyn-translation.module';
import { ComponentTranslateLoader } from './modules/core/translation/component-translate-loader';
import { DefaultTranslateLoader } from './modules/core/translation/default-translate-loader';
import { TasksRemoteDefaultService } from './modules/menu-items/algorithms/services/tasks-remote-default.service';
import { TasksModule } from './modules/menu-items/algorithms/tasks.module';
import { CasesModule } from './modules/menu-items/cases/cases.module';
import { FiltersModule } from './modules/menu-items/filters/filters.module';
import { HelpModule } from './modules/menu-items/help/help.module';
import { LayersManagerModule } from './modules/menu-items/layers-manager/layers-manager.module';
import { SettingsModule } from './modules/menu-items/settings/settings.module';
import { ToolsModule } from './modules/menu-items/tools/tools.module';
import { OverlaysModule } from './modules/overlays/overlays.module';
import { AnsynPluginsModule } from './modules/plugins/ansyn-plugins.module';
import { StatusBarModule } from './modules/status-bar/status-bar.module';
import { TranslateService } from '@ngx-translate/core';
import { ImageryZoomerComponent } from './modules/plugins/components/imagery-zoomer/imagery-zoomer.component';

@NgModule({
	imports: [
		CommonModule,
		AnsynTranslationModule.addLoader([DefaultTranslateLoader, ComponentTranslateLoader]),
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
		AnsynPluginsModule,
		CoreModule,
		MenuModule.provideMenuItems(ansynConfig.ansynMenuItems),
		AlertsModule.provideAlerts(ansynConfig.ansynAlerts),
		AppEffectsModule,
		MapFacadeModule.provide({
			entryComponents: {
				container: [AnnotationContextMenuComponent, AngleFilterComponent, ImageryZoomerComponent],
				status: []
			}
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
		OverlayOutOfBoundsComponent, ImageryZoomerComponent
	],
	declarations: [
		AnsynComponent,
		OverlayOutOfBoundsComponent,
		UnsupportedDevicesComponent,
		AnsynFooterComponent,
		ImageryZoomerComponent
	],
	exports: [AnsynComponent, UnsupportedDevicesComponent]
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

	constructor(public translate: TranslateService) {
		translate.setDefaultLang('default');
	}
}
