import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CasesComponent } from './cases/cases.component';
import { CoreModule, StoreService, MenuItem } from "@ansyn/core";
import { InfiniteScrollModule } from "@ansyn/utils";
import { CasesTableComponent } from './cases-table/cases-table.component';
import { EditCaseComponent } from "./edit-case/edit-case.component";
import { FormsModule } from "@angular/forms";
import { CasesModalContainerComponent } from './cases-modal-container/cases-modal-container.component';
import { DeleteCaseComponent } from './delete-case/delete-case.component';
import { CasesToolsComponent } from './cases-tools/cases-tools.component';

@NgModule({
  imports: [CommonModule, CoreModule, InfiniteScrollModule, FormsModule],
  declarations: [CasesComponent, CasesTableComponent, EditCaseComponent, CasesModalContainerComponent, DeleteCaseComponent, CasesToolsComponent],
  entryComponents:[CasesComponent, EditCaseComponent, DeleteCaseComponent]
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
