import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {StoreService} from "./store.service";
import {MenuService} from "./services/menu.service";

@NgModule({
  imports: [CommonModule],
  providers: [StoreService, MenuService]
})
export class CoreModule { }
