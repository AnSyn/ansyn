import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from "./store.service";
import { MenuService } from "./services/menu.service";
import { DataLayersService } from './services/data-layers.service';

@NgModule({
  imports: [CommonModule],
  providers: [StoreService, MenuService, DataLayersService]
})

export class CoreModule { }
