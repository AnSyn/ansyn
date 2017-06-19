import { MenuItemsConfig } from './models/menu-items-config';
import { NgModule, ModuleWithProviders, InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CasesModule, FiltersModule, LayersManagerModule, ToolsModule, AlgorithmsModule, SettingsModule } from "./index";
import { casesConfig } from '@ansyn/menu-items/cases';
import { layersConfig } from '@ansyn/menu-items/layers-manager';
import { filtersConfig } from '@ansyn/menu-items/filters';
const menuItemsConfig: InjectionToken<MenuItemsConfig> = new InjectionToken('menu-items-config');

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

export class MenuItemsModule {
  static forRoot(config: MenuItemsConfig): ModuleWithProviders {
    return {
      ngModule: MenuItemsModule,
      providers: [
        { provide: casesConfig, useValue: config.CasesConfig },
        { provide: layersConfig, useValue: config.LayersManagerConfig },
        { provide: filtersConfig, useValue: config.FiltersConfig }
      ]
    };
  }
}
