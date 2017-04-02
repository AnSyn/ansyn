import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CasesComponent } from './cases/cases.component';
import { CoreModule, StoreService, MenuItem } from "@ansyn/core";
import { InfiniteScrollModule } from "@ansyn/utils";
import {Case} from "@ansyn/core";

@NgModule({
  imports: [CommonModule, CoreModule, InfiniteScrollModule],
  declarations: [CasesComponent],
  entryComponents:[CasesComponent]
})
export class CasesModule {
  constructor(storeService:StoreService){
    let menu_item: MenuItem = {
      name:"Cases",
      component: CasesComponent,
      icon_url: "/assets/icons/cases.svg"
    };
    storeService.menu.addMenuItem(menu_item);
  }
}
