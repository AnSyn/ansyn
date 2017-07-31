import { CasesConfig } from '@ansyn/menu-items/cases';
import { LayersManagerConfig } from '@ansyn/menu-items/layers-manager';
import { FiltersConfig } from '@ansyn/menu-items/filters';
import { ToolsConfig } from '@ansyn/menu-items/tools';

export interface MenuItemsConfig {
    CasesConfig: CasesConfig;
    LayersManagerConfig: LayersManagerConfig;
    FiltersConfig: FiltersConfig;
    ToolsConfig: ToolsConfig
}
