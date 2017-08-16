import { NgModule, ModuleWithProviders, InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuItemsConfig } from './models/menu-items-config';
import { CasesModule } from './cases/cases.module';
import { FiltersModule } from './filters/filters.module';
import { LayersManagerModule } from './layers-manager/layers-manager.module';
import { ToolsModule } from './tools/tools.module';
import { AlgorithmsModule } from './algorithms/algorithms.module';
import { SettingsModule } from './settings/settings.module';
import { casesConfig } from './cases/services/cases.service';
import { layersConfig } from './layers-manager/services/data-layers.service';
import { filtersConfig } from './filters/services/filters.service';
import { toolsConfig } from './tools/models/tools-config';

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
				{ provide: filtersConfig, useValue: config.FiltersConfig },
				{ provide: toolsConfig, useValue: config.ToolsConfig }
			]
		};
	}
}
