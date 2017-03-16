import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings/settings.component';
import {MenuItem} from "../../menu-item.model";
import {MenuService} from "../../menu.service";

@NgModule({
  imports: [CommonModule],
  declarations: [SettingsComponent],
  entryComponents:[SettingsComponent]
})
export class SettingsModule {
  constructor(menuService:MenuService){
    menuService.addMenuItem(new MenuItem("Settings", SettingsComponent, "/assets/icons/settings.svg"));
  }
}
