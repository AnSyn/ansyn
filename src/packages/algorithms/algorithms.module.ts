import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlgorithmsComponent } from './algorithms/algorithms.component';
import {CoreModule, StoreService, MenuItem} from "@ansyn/core";

@NgModule({
  imports: [CoreModule, CommonModule],
  declarations: [AlgorithmsComponent],
  entryComponents:[AlgorithmsComponent],
  exports:[AlgorithmsComponent]
})
export class AlgorithmsModule {
  constructor(storeService:StoreService){
    storeService.menu.addMenuItem(new MenuItem("Algorithms", AlgorithmsComponent, "/assets/icons/algorithms.svg"));
  }
}
