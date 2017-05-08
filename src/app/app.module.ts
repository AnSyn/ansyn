import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { CoreModule } from '@ansyn/core';
import { MenuModule } from '@ansyn/menu';
import { TimelineModule } from '@ansyn/timeline';
import { MenuItemsModule } from '@ansyn/menu-items';
import { EffectsModule } from '@ngrx/effects';
import { AppReducer, reducer } from './app.reducers.module';
import { ImageryModule } from '@ansyn/imagery/imagery.module';
import { mapAppEffects } from './effects/map.effects';
import { StoreModule } from '@ngrx/store';
import { ImageryOpenLayerMapModule } from '@ansyn/imageryOpenLayerMap/imageryOpenLayerMap.module';
import { CasesAppEffects } from './effects/cases.app.effects';

@NgModule({
	declarations: [
		AppComponent,
	],
	imports: [
		ImageryOpenLayerMapModule,
		BrowserModule,
		FormsModule,
		HttpModule,
		CoreModule,
		MenuModule,
		MenuItemsModule,
		TimelineModule,
		AppReducer,
		// StoreModule.provideStore(reducer),
		//RouterStoreModule.connectRouter(),
		//StoreDevtoolsModule.instrumentOnlyWithExtension(),
		ImageryModule
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
