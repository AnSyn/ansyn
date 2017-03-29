import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolsComponent } from './tools/tools.component';
import {CoreModule, StoreService, MenuItem} from "@ansyn/core";

@NgModule({
  imports: [CommonModule, CoreModule],
  declarations: [ToolsComponent],
  entryComponents: [ToolsComponent],
})
export class ToolsModule {
  constructor(storeService:StoreService){
    let menu_item: MenuItem = {
      name:"Tools",
      component: ToolsComponent,
      icon_url: "/assets/icons/tools.svg"
    };
    storeService.menu.addMenuItem(menu_item);
  }
}
