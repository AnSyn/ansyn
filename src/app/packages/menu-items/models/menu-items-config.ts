import { ICasesConfig } from '@ansyn/menu-items/cases';
import { ILayersManagerConfig } from '@ansyn/menu-items/layers-manager';
import { IFiltersConfig } from '@ansyn/menu-items/filters';
import { IToolsConfig } from '@ansyn/menu-items/tools/models/tools-config';

export interface MenuItemsConfig {
    CasesConfig: ICasesConfig;
    LayersManagerConfig: ILayersManagerConfig;
    FiltersConfig: IFiltersConfig;
    ToolsConfig: IToolsConfig;
}
