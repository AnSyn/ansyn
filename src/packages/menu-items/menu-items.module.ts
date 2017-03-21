import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CasesModule, FiltersModule, DataLayersModule, ToolsModule, AlgorithmsModule, SettingsModule} from "./index";

@NgModule({
  imports: [
    CommonModule,
    CasesModule,
    FiltersModule,
    DataLayersModule,
    ToolsModule,
    AlgorithmsModule,
    SettingsModule
  ]
})

export class MenuItemsModule { }
