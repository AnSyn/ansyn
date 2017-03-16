import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import {MenuModule} from "./menu/menu.module";
import {AppDataModule} from "./app-data/app-data.module";

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MenuModule,
    AppDataModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
