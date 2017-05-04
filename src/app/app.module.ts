import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { CoreModule } from '@ansyn/core';
import { MenuModule } from '@ansyn/menu';
import { TimelineModule } from '@ansyn/timeline';
import { MenuItemsModule } from "@ansyn/menu-items";
import { EffectsModule } from '@ngrx/effects';
import { AppReducer, reducer } from './app.reducers.module';
import { ImageryModule } from './packages/imagery/imagery.module';
import { mapAppEffects } from './effects/map.effects';
import { StoreModule } from '@ngrx/store';

@NgModule({
	declarations: [
		AppComponent,
	],
	imports: [
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
		EffectsModule,
		EffectsModule.run(mapAppEffects),
		ImageryModule
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
