import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CasesModule} from "./cases/cases.module";
import {DataLayersModule} from "./layers-manager/layers-manager.module";
import {FiltersModule} from "./filters/filters.module";
import {SettingsModule} from "./settings/settings.module";
import {ToolsModule} from "./tools/tools.module";
import {AlgorithmsModule} from "./algorithms/algorithms.module";

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
