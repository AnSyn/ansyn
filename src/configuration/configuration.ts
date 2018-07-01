import { AlgorithmsComponent } from '@ansyn/menu-items/algorithms/algorithms/algorithms.component';
import { SettingsComponent } from '@ansyn/menu-items/settings/settings/settings.component';
import { FiltersCollectionComponent } from '@ansyn/menu-items/filters/components/filters-collection/filters-collection.component';
import { ToolsComponent } from '@ansyn/menu-items/tools/tools/tools.component';
import { LayersManagerComponent } from '@ansyn/menu-items/layers-manager/components/layers-manager/layers-manager.component';
import { HelpComponent } from '@ansyn/menu-items/help/components/help.component';
import { CasesComponent } from '@ansyn/menu-items/cases/components/cases/cases.component';

export const configuration = {
	production: false,
	configPath: 'assets/config/app.config.json',
	ansynMenuItems: [
		{
			name: 'Cases',
			component: CasesComponent,
			iconClass: 'icon-main-cases',
			production: true
		},
		{
			name: 'Filters',
			component: FiltersCollectionComponent,
			iconClass: 'icon-main-filters',
			production: true
		},
		{
			name: 'Data Layers',
			component: LayersManagerComponent,
			iconClass: 'icon-main-data-layers',
			production: true
		},
		{
			name: 'Tools',
			component: ToolsComponent,
			iconClass: 'icon-main-tools',
			production: true
		},
		{
			name: 'Algorithms',
			component: AlgorithmsComponent,
			iconClass: 'icon-main-algorithms',
			production: false
		},
		{
			name: 'Settings',
			component: SettingsComponent,
			iconClass: 'icon-main-settings',
			production: false
		},
		{
			name: 'Help',
			component: HelpComponent,
			iconClass: 'icon-help-settings',
			production: true
		}
	]
};
