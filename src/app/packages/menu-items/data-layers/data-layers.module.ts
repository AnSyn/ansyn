import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataLayersComponent } from './data-layers/data-layers.component';
import {CoreModule, StoreService, MenuItem} from "@ansyn/core";

@NgModule({
  imports: [CoreModule, CommonModule],
  declarations: [DataLayersComponent],
  entryComponents: [DataLayersComponent]
})
export class DataLayersModule {
  constructor(storeService:StoreService){
    let menu_item: MenuItem = {
      name:"Data Layers",
      component: DataLayersComponent,
      icon_url: "/assets/icons/data-layers.svg"
    };
    storeService.menu.addMenuItem(menu_item);
  }
}
