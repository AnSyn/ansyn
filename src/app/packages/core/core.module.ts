import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from "./store.service";
import { MenuService } from "./services/menu.service";
import { CasesService } from "./services/cases.service";
import { DataLayersService } from './services/data-layers.service';
import { HttpModule } from '@angular/http';
import { CaseModalService } from "./services/case-modal.service";

@NgModule({
  imports: [CommonModule, HttpModule],
  providers: [StoreService, MenuService, CasesService, DataLayersService, CaseModalService]
})

export class CoreModule { }
