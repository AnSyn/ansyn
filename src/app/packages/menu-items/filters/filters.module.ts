import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FiltersComponent} from "./filters/filters.component";
import {CoreModule, StoreService, MenuItem} from "@ansyn/core";

@NgModule({
  imports: [CommonModule, CoreModule],
  declarations:[FiltersComponent],
  entryComponents:[FiltersComponent]
})
export class FiltersModule {
  constructor(storeService:StoreService){
    let menu_item: MenuItem = {
      name:"Filters",
      component: FiltersComponent,
      icon_url: "/assets/icons/filters.svg"
    };
    storeService.menu.addMenuItem(menu_item);
  }
}
