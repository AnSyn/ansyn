import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ansynMenuItems } from './ansyn.menu-items';
import { AnsynComponent } from './ansyn/ansyn.component';
import { StatusBarModule } from '@ansyn/status-bar/status-bar.module';
import { OverlaysModule } from '@ansyn/overlays/overlays.module';
import { AnsynPluginsModule } from '@ansyn/plugins/ansyn-plugins.module';
import { AppProvidersModule } from './app-providers/app-providers.module';
import { AppEffectsModule } from './app-effects/app.effects.module';
import { AlertsModule } from '@ansyn/core/alerts/alerts.module';
import { ansynAlerts } from '@ansyn/ansyn/ansyn-alerts';
import { CasesModule } from '@ansyn/menu-items/cases/cases.module';
import { FiltersModule } from '@ansyn/menu-items/filters/filters.module';
import { LayersManagerModule } from '@ansyn/menu-items/layers-manager/layers-manager.module';
import { ToolsModule } from '@ansyn/menu-items/tools/tools.module';
import { AlgorithmsModule } from '@ansyn/menu-items/algorithms/algorithms.module';
import { SettingsModule } from '@ansyn/menu-items/settings/settings.module';
import { ImagerySandBoxModule } from '@ansyn/menu-items/imagerySandBox/imagery-sand-box.module';
import { MenuModule } from '@ansyn/menu/menu.module';
import { MapFacadeModule } from '@ansyn/map-facade/map-facade.module';
import { ImageryModule } from '@ansyn/imagery/imagery.module';
import { AnsynRouterModule } from '@ansyn/router/router.module';
import { ContextModule } from '@ansyn/context/context.module';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from '@ansyn/core/core.module';

export const ansynImports: any = [
	CommonModule,
	AppProvidersModule,
	CasesModule,
	FiltersModule,
	LayersManagerModule,
	ToolsModule,
	AlgorithmsModule,
	SettingsModule,
	ImagerySandBoxModule,
	OverlaysModule,
	FormsModule,
	HttpClientModule,
	BrowserAnimationsModule,
	AnsynPluginsModule,
	CoreModule,
	ContextModule,
	MenuModule.provideMenuItems(ansynMenuItems),
	AlertsModule.provideAlerts(ansynAlerts),
	AppEffectsModule,
	MapFacadeModule,
	ImageryModule,
	StatusBarModule,
	AnsynRouterModule
];

@NgModule({
	imports: ansynImports,
	declarations: [AnsynComponent],
	exports: [AnsynComponent]
})

export class AnsynModule {


}
