import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FiltersComponent} from "./filters/filters.component";
import {MenuItem} from "../../menu-item.model";
import {MenuService} from "../../menu.service";

@NgModule({
  imports: [CommonModule],
  declarations:[FiltersComponent],
  entryComponents:[FiltersComponent]
})
export class FiltersModule {
  constructor(menuService:MenuService){
    menuService.addMenuItem(new MenuItem("Filters", FiltersComponent, "/assets/icons/filters.svg"));
  }
}
