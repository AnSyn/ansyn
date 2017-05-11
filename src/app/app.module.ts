import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { CoreModule } from '@ansyn/core';
import { MenuModule } from '@ansyn/menu';
import { MenuItemsModule } from '@ansyn/menu-items';
import { AppReducer } from './app.reducers.module';
import { ImageryModule } from '@ansyn/imagery/imagery.module';
import { ImageryOpenLayerMapModule } from '@ansyn/imageryOpenLayerMap/imageryOpenLayerMap.module';
import { OverlaysModule } from '@ansyn/overlays';
import { ImagerySandBoxModule } from '@ansyn/menu-items/imagerySandBox/imagery-sand-box.module';



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
		OverlaysModule,
		AppReducer,
		ImageryModule,
		ImagerySandBoxModule
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
