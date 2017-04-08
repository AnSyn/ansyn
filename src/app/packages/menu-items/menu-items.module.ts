import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CasesModule, FiltersModule, LayersManagerModule, ToolsModule, AlgorithmsModule, SettingsModule} from "./index";

@NgModule({
  imports: [
    CommonModule,
    CasesModule,
    FiltersModule,
    LayersManagerModule,
    ToolsModule,
    AlgorithmsModule,
    SettingsModule
  ]
})

export class MenuItemsModule { }
