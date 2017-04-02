import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {StoreService} from "./store.service";
import {MenuService} from "./services/menu.service";
import {CasesService} from "./services/cases.service";

@NgModule({
  imports: [CommonModule],
  providers: [StoreService, MenuService, CasesService]
})
export class CoreModule { }
