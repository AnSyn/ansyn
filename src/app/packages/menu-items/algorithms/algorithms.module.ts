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
    let menu_item: MenuItem = {
      name:"Algorithms",
      component: AlgorithmsComponent,
      icon_url: "/assets/icons/algorithms.svg"
    };
    storeService.menu.addMenuItem(menu_item);
  }
}
