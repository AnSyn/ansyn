import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CasesModule} from "../../packages/cases/cases.module";
import {FiltersModule} from "../../packages/filters/filters.module";
import {AlgorithmsModule} from "../../packages/algorithms/algorithms.module";
import {SettingsModule} from "../../packages/settings/settings.module";
import {ToolsModule} from "../../packages/tools/tools.module";
import {DataLayersModule} from "../../packages/data-layers/data-layers.module";

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
