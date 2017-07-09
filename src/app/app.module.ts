import { FilterMetadata, EnumFilterMetadata } from '@ansyn/menu-items/filters';
import { configuration } from './../configuration/configuration';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { CoreModule } from '@ansyn/core';
import { MenuModule } from '@ansyn/menu';
import { MenuItemsModule } from '@ansyn/menu-items';
import { ImageryModule, BaseSourceProvider } from '@ansyn/imagery';
import { CesiumMapModule } from '@ansyn/cesium-map';
import { OpenLayerMapModule } from '@ansyn/open-layers-map';
import { OverlaysModule } from '@ansyn/overlays';
import { MapFacadeModule } from '@ansyn/map-facade';
import { ImagerySandBoxModule } from '@ansyn/menu-items/imagerySandBox';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRouter } from './app-routing.module';
import { AnsynComponent } from './ansyn/ansyn.component';
import { AppReducersModule } from './app-reducers/app-reducers.module';
import { StatusBarModule } from '@ansyn/status-bar/status-bar.module';
import { OpenLayerTileWMSSourceProvider, OpenLayerTileWMSSourceProviderMapType, OpenLayerTileWMSSourceProviderSourceType } from './app-models/map-source-providers/open-layers-TileWMS-source-provider';
import { OpenLayerOSMSourceProvider, OpenLayerOSMSourceProviderMapType, OpenLayerOSMSourceProviderSourceType } from './app-models/map-source-providers/open-layers-OSM-source-provider';
import { OpenLayerIDAHOSourceProvider, OpenLayerIDAHOSourceProviderMapType, OpenLayerIDAHOSourceProviderSourceType } from './app-models/map-source-providers/open-layers-IDAHO-source-provider';
import { OpenLayerBingSourceProvider, OpenLayerBingSourceProviderMapType, OpenLayerBingSourceProviderSourceType } from './app-models/map-source-providers/open-layers-BING-source-provider';
import { OpenLayerCenterMarkerPluginModule } from '@ansyn/open-layer-center-marker-plugin';
import { TypeContainerModule } from '@ansyn/type-container';

@NgModule({
	providers: [
		{ provide: BaseSourceProvider , useClass: OpenLayerTileWMSSourceProvider, multi:true},
		{ provide: BaseSourceProvider , useClass: OpenLayerOSMSourceProvider, multi:true},
		{ provide: BaseSourceProvider , useClass: OpenLayerIDAHOSourceProvider, multi:true},
		{ provide: BaseSourceProvider , useClass: OpenLayerBingSourceProvider, multi: true},
		{ provide: FilterMetadata, useClass:EnumFilterMetadata, multi: true }
	],
	declarations: [
		AppComponent,
		AnsynComponent
	],
	imports: [
		OpenLayerCenterMarkerPluginModule,
		OpenLayerMapModule,
		CesiumMapModule,
		BrowserModule,
		FormsModule,
		HttpModule,
		BrowserAnimationsModule,
		CoreModule,
		MenuModule,
		MenuItemsModule.forRoot(<any>configuration),
		OverlaysModule.forRoot(<any>configuration.OverlaysConfig),
		AppRouter,
		AppReducersModule,
		ImagerySandBoxModule,
		MapFacadeModule,
		ImageryModule.forRoot(configuration.ImageryConfig),
		StatusBarModule
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
