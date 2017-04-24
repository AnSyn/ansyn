import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { CoreModule } from '@ansyn/core';
import { MenuModule } from '@ansyn/menu';
import { TimelineModule } from '@ansyn/timeline';
import { MenuItemsModule } from "@ansyn/menu-items";
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AppReducers } from './app.reducers';
//import { RouterStoreModule } from '@ngrx/router-store';
//import { StoreDevtoolsModule } from '@ngrx/store-devtools';






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
    StoreModule.provideStore(AppReducers()),
    //RouterStoreModule.connectRouter(),
    //StoreDevtoolsModule.instrumentOnlyWithExtension(),
    EffectsModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
