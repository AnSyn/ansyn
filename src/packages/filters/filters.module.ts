import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FiltersComponent} from "./filters/filters.component";
import {CoreModule, StoreService, MenuItem} from "core";

@NgModule({
  imports: [CommonModule, CoreModule],
  declarations:[FiltersComponent],
  entryComponents:[FiltersComponent]
})
export class FiltersModule {
  constructor(storeService:StoreService){
    storeService.menu.addMenuItem(new MenuItem("Filters", FiltersComponent, "/assets/icons/filters.svg"));
  }
}
