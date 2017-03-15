import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmsComponent } from './algorithms/algorithms.component';
import {MenuService} from "../../menu.service";
import {MenuItem} from "../../menu-item.model";

@NgModule({
  imports: [CommonModule],
  declarations: [AlgorithmsComponent],
  entryComponents:[AlgorithmsComponent],
  exports:[AlgorithmsComponent]
})
export class AlgorithmsModule {
  constructor(menuService:MenuService){
    menuService.addMenuItem(new MenuItem("Algorithms", AlgorithmsComponent, "/assets/icons/algorithms.svg"));
  }
}
