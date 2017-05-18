import { configuration } from './../configuration/configuration';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { CoreModule } from '@ansyn/core';
import { MenuModule } from '@ansyn/menu';
import { MenuItemsModule } from '@ansyn/menu-items';
import { ImageryModule } from '@ansyn/imagery/imagery.module';
import { ImageryCesiumMapModule } from '@ansyn/cesium-map';
import { ImageryOpenLayerMapModule } from '@ansyn/imageryOpenLayerMap/imageryOpenLayerMap.module';
import { OverlaysModule } from '@ansyn/overlays';
import { MapFacadeModule } from '@ansyn/map-facade';
import { ImagerySandBoxModule } from '@ansyn/menu-items/imagerySandBox';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRouter } from './app-routing.module';
import { AnsynComponent } from './ansyn/ansyn.component';
import { AppReducersModule } from './app-reducers/app-reducers.module';

@NgModule({
	declarations: [
		AppComponent,
		AnsynComponent,
	],
	imports: [
		ImageryOpenLayerMapModule,
		ImageryCesiumMapModule,
		BrowserModule,
		FormsModule,
		HttpModule,
		BrowserAnimationsModule,
		CoreModule,
		MenuModule,
		MenuItemsModule.forRoot(configuration),
		OverlaysModule.forRoot(configuration.OverlaysConfig),
		AppReducersModule,
		AppRouter,
		ImageryModule,
		ImagerySandBoxModule,
		MapFacadeModule,
		ImageryModule
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
