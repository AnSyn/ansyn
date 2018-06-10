import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { AnsynApi } from '@builder/api/ansyn-api.service';
import { builderFeatureKey, BuilderReducer } from '@builder/reducers/builder.reducer';
import { MapFacadeModule } from '@ansyn/map-facade/map-facade.module';
import { StatusBarModule } from '@ansyn/status-bar/status-bar.module';
import { CoreModule } from '@ansyn/core/core.module';
import { FormsModule } from '@angular/forms';
import { AlertsModule } from '@ansyn/core/alerts/alerts.module';
import { ToolsModule } from '@ansyn/menu-items/tools/tools.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppEffectsModule } from '@ansyn/ansyn/app-effects/app.effects.module';
import { EffectsModule } from '@ngrx/effects';
import { AnsynPluginsModule } from '@ansyn/plugins/ansyn-plugins.module';
import { HttpClientModule } from '@angular/common/http';
import { FiltersModule } from '@ansyn/menu-items/filters/filters.module';
import { ansynAlerts } from '@ansyn/ansyn/ansyn-alerts';
import { AppProvidersModule } from '@ansyn/ansyn/app-providers/app-providers.module';
import { OverlaysModule } from '@ansyn/overlays/overlays.module';
import { ImageryModule } from '@ansyn/imagery/imagery.module';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		HttpClientModule,
		BrowserAnimationsModule,

		AppProvidersModule,
		OverlaysModule,
		AnsynPluginsModule,
		ToolsModule,
		CoreModule,
		AlertsModule.provideAlerts(ansynAlerts),
		AppEffectsModule,
		MapFacadeModule,
		ImageryModule,
		StatusBarModule,
		FiltersModule,
		StoreModule.forFeature(builderFeatureKey, BuilderReducer),
	],
	providers: [AnsynApi]
})

export class AnsynBuilderModule {

}
