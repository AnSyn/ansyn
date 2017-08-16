import { CasesConfig } from '@ansyn/menu-items/cases';
import { FiltersConfig } from '@ansyn/menu-items/filters';
import { ToolsConfig } from '@ansyn/menu-items/tools/models/tools-config';

export interface MenuItemsConfig {
    CasesConfig: CasesConfig;
    FiltersConfig: FiltersConfig;
    ToolsConfig: ToolsConfig
}
