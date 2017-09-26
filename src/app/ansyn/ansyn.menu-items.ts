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
		iconUrl: '/assets/icons/cases.svg',
		production: true
	},
	{
		name: 'Filters',
		component: FiltersCollectionComponent,
		iconUrl: '/assets/icons/filters.svg',
		production: true
	},
	{
		name: 'Layers Manager',
		component: LayersManagerComponent,
		iconUrl: '/assets/icons/data-layers.svg',
		production: true
	},
	{
		name: 'Tools',
		component: ToolsComponent,
		iconUrl: '/assets/icons/tools.svg',
		production: true
	},
	{
		name: 'Algorithms',
		component: AlgorithmsComponent,
		iconUrl: '/assets/icons/algorithms.svg',
		production: false
	},
	{
		name: 'Settings',
		component: SettingsComponent,
		iconUrl: '/assets/icons/settings.svg',
		production: false
	},
	{
		name: 'Imagery SandBox',
		component: ImagerySandBoxComponent,
		iconUrl: '/assets/icons/tools.svg',
		production: false
	}
];

