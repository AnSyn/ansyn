import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CasesComponent } from './cases/cases.component';
import {CoreModule, StoreService, MenuItem} from "@ansyn/core";
import {InfiniteScrollModule} from "@ansyn/utils";

@NgModule({
  imports: [CommonModule, CoreModule, InfiniteScrollModule],
  declarations: [CasesComponent],
  entryComponents:[CasesComponent]
})
export class CasesModule {
  constructor(storeService:StoreService){
    storeService.menu.addMenuItem(new MenuItem("Cases", CasesComponent, "/assets/icons/cases.svg"));
  }
}
