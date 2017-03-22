import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings/settings.component';
import {CoreModule, StoreService, MenuItem} from "@ansyn/core";

@NgModule({
  imports: [CommonModule, CoreModule],
  declarations: [SettingsComponent],
  entryComponents:[SettingsComponent]
})
export class SettingsModule {
  constructor(storeService:StoreService){
    storeService.menu.addMenuItem(new MenuItem("Settings", SettingsComponent, "/assets/icons/settings.svg"));
  }
}
