import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataLayersComponent } from './data-layers/data-layers.component';
import {MenuItem} from "../../menu-item.model";
import { MenuService} from "../../menu.service";

@NgModule({
  imports: [CommonModule],
  declarations: [DataLayersComponent],
  entryComponents: [DataLayersComponent]
})
export class DataLayersModule {
  constructor(menuService:MenuService){
    menuService.addMenuItem(new MenuItem("Data Layers", DataLayersComponent, "/assets/icons/data-layers.svg"));
  }
}
