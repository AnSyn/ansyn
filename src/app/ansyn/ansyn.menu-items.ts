import { MenuItem } from '@ansyn/menu/models';
import { CasesComponent } from '@ansyn/menu-items/cases/components/cases/cases.component';
import { FiltersCollectionComponent } from '@ansyn/menu-items/filters/components/filters-collection/filters-collection.component';
import { LayersManagerComponent } from '@ansyn/menu-items/layers-manager/components/layers-manager/layers-manager.component';
import { ToolsComponent } from '@ansyn/menu-items/tools/tools/tools.component';
import { AlgorithmsComponent } from '@ansyn/menu-items/algorithms/algorithms/algorithms.component';
import { SettingsComponent } from '@ansyn/menu-items/settings/settings/settings.component';
import { ImagerySandBoxComponent } from '@ansyn/menu-items/imagerySandBox/component/imagery-sand-box.component';

export const ansynMenuItems: MenuItem[] = [
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
		name: 'Layers Manager',
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
		name: 'Imagery SandBox',
		component: ImagerySandBoxComponent,
		iconClass: 'icon-main-tools',
		production: false
	}
];
