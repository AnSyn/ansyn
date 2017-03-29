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
    let menu_item: MenuItem = {
      name:"Settings",
      component: SettingsComponent,
      icon_url: "/assets/icons/settings.svg"
    };
    storeService.menu.addMenuItem(menu_item);
  }
}
