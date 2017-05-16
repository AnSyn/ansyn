import { MenuItemsConfig } from './models/menu-items-config';
import { NgModule, ModuleWithProviders, InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CasesModule, FiltersModule, LayersManagerModule, ToolsModule, AlgorithmsModule, SettingsModule } from "./index";

const menuItemsConfig: InjectionToken<MenuItemsConfig> = new InjectionToken('menu-items-config');

@NgModule({
  imports: [
    CommonModule,
    CasesModule.forRoot({casesBaseUrl: "casesBaseUrl"}),
    FiltersModule,
    LayersManagerModule.forRoot({layersByCaseIdUrl: "layersByCaseIdUrl"}),
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
        { provide: menuItemsConfig, useValue: config }
      ]
    };
  }
}
