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
    storeService.menu.addMenuItem(new MenuItem("Data Layers", DataLayersComponent, "/assets/icons/data-layers.svg"));
  }
}
