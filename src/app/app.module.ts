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
import { CesiumMapModule } from '@ansyn/cesium-map';
import { OpenLayerMapModule } from '@ansyn/open-layers-map';
import { OverlaysModule } from '@ansyn/overlays';
import { MapFacadeModule } from '@ansyn/map-facade';
import { ImagerySandBoxModule } from '@ansyn/menu-items/imagerySandBox';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRouter } from './app-routing.module';
import { AnsynComponent } from './ansyn/ansyn.component';
import { AppReducersModule } from './app-reducers/app-reducers.module';
import { BaseSourceProvider } from '@ansyn/imagery';
import { StatusBarModule } from '@ansyn/status-bar/status-bar.module';
import { OpenLayerTileWMSSourceProvider } from './app-models/map-source-providers/open-layers-TileWMS-source-provider';
import { OpenLayerOSMSourceProvider } from './app-models/map-source-providers/open-layers-OSM-source-provider';
import { OpenLayerIDAHOSourceProvider } from './app-models/map-source-providers/open-layers-IDAHO-source-provider'
import { OpenLayerCenterMarkerPluginModule } from '@ansyn/open-layer-center-marker-plugin';
import { TypeContainerModule } from '@ansyn/type-container';
import { LoadingSpinnerModule } from '@ansyn/loading-spinner';

@NgModule({
	providers:[
	],
	declarations: [
		AppComponent,
		AnsynComponent
	],
	imports: [
		TypeContainerModule.register({
			baseType :BaseSourceProvider,
			type : OpenLayerTileWMSSourceProvider,
			name : ['openLayersMap','TileWMS'].join(',')
		}),
		TypeContainerModule.register({
			baseType :BaseSourceProvider,
			type : OpenLayerOSMSourceProvider,
			name : ['openLayersMap','OSM'].join(',')
		}),
		TypeContainerModule.register({
			baseType :BaseSourceProvider,
			type : OpenLayerIDAHOSourceProvider,
			name : ['openLayersMap','IDAHO'].join(',')
		}),
		LoadingSpinnerModule,
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
