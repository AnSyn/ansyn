import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CasesComponent } from './cases/cases.component';
import {MenuService} from "../../menu.service";
import {MenuItem} from "../../menu-item.model";
import { InfiniteScrollDirective } from './infinite-scroll.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [CasesComponent, InfiniteScrollDirective],
  entryComponents:[CasesComponent]
})
export class CasesModule {
  constructor(menuService:MenuService){
    menuService.addMenuItem(new MenuItem("Cases", CasesComponent, "/assets/icons/cases.svg"));
  }
}
