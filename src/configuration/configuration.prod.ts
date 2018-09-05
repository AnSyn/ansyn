import { FiltersCollectionComponent } from '@ansyn/menu-items/filters/components/filters-collection/filters-collection.component';
import { ToolsComponent } from '@ansyn/menu-items/tools/tools/tools.component';
import { LayersManagerComponent } from '@ansyn/menu-items/layers-manager/components/layers-manager/layers-manager.component';
import { HelpComponent } from '@ansyn/menu-items/help/components/help.component';
import { CasesComponent } from '@ansyn/menu-items/cases/components/cases/cases.component';
import { constConfiguration } from './configuration.const';

export const configuration = {
	...constConfiguration,
	needToUseLayerExtent: false,
	production: true,
	ansynMenuItems: [
		{
			name: 'Cases',
			component: CasesComponent,
			iconClass: 'icon-main-cases'
		},
		{
			name: 'Filters',
			component: FiltersCollectionComponent,
			iconClass: 'icon-main-filters'
		},
		{
			name: 'Data Layers',
			component: LayersManagerComponent,
			iconClass: 'icon-main-data-layers'
		},
		{
			name: 'Tools',
			component: ToolsComponent,
			iconClass: 'icon-main-tools'
		},
		{
			name: 'Help',
			component: HelpComponent,
			iconClass: 'icon-help-settings'
		}
	],
};
