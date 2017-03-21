import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import {MenuItemsModule} from "@ansyn/menu-items";
import {CoreModule} from "@ansyn/core";
import {MenuModule} from "@ansyn/menu";

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
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
