import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CasesComponent } from './components/cases/cases.component';
import { CoreModule, StoreService, MenuItem } from "@ansyn/core";
import { InfiniteScrollModule } from "@ansyn/utils";
import { CasesTableComponent } from './components/cases-table/cases-table.component';
import { EditCaseComponent } from "./components/edit-case/edit-case.component";
import { FormsModule } from "@angular/forms";
import { CasesModalContainerComponent } from './components/cases-modal-container/cases-modal-container.component';
import { DeleteCaseComponent } from './components/delete-case/delete-case.component';
import { CasesToolsComponent } from './components/cases-tools/cases-tools.component';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { casesReducer } from './reducers/cases.reducer';
import { CasesEffects } from './effects/cases.effects';
import { CasesService } from './services/cases.service';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    InfiniteScrollModule,
    FormsModule,
    StoreModule.provideStore({cases: casesReducer}),
    EffectsModule.run(CasesEffects)
  ],
  declarations: [CasesComponent, CasesTableComponent, EditCaseComponent, CasesModalContainerComponent, DeleteCaseComponent, CasesToolsComponent],
  entryComponents:[CasesComponent, EditCaseComponent, DeleteCaseComponent],
  providers: [CasesService]
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
