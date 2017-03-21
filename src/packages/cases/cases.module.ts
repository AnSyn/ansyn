import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CasesComponent } from './cases/cases.component';
import { InfiniteScrollDirective } from './infinite-scroll.directive';
import {CoreModule, StoreService, MenuItem} from "@ansyn/core";

@NgModule({
  imports: [CommonModule, CoreModule],
  declarations: [CasesComponent, InfiniteScrollDirective],
  entryComponents:[CasesComponent]
})
export class CasesModule {
  constructor(storeService:StoreService){
    storeService.menu.addMenuItem(new MenuItem("Cases", CasesComponent, "/assets/icons/cases.svg"));
  }
}
