import { MenuItem } from '@ansyn/menu/models';
import { CasesComponent } from '../packages/menu-items/cases/components/cases/cases.component';
import { FiltersCollectionComponent } from '../packages/menu-items/filters/components/filters-collection/filters-collection.component';
import { LayersManagerComponent } from '../packages/menu-items/layers-manager/components/layers-manager/layers-manager.component';
import { ToolsComponent } from '../packages/menu-items/tools/tools/tools.component';
import { AlgorithmsComponent } from '../packages/menu-items/algorithms/algorithms/algorithms.component';
import { SettingsComponent } from '../packages/menu-items/settings/settings/settings.component';
import { ImagerySandBoxComponent } from '../packages/menu-items/imagerySandBox/component/imagery-sand-box.component';

export const ansynMenuItems: MenuItem[] = [
	{
		name: 'Cases',
		component: CasesComponent,
		icon_url: '/assets/icons/cases.svg'
	},
	{
		name: 'Filters',
		component: FiltersCollectionComponent,
		icon_url: '/assets/icons/filters.svg'
	},
	{
		name: 'Layers Manager',
		component: LayersManagerComponent,
		icon_url: '/assets/icons/data-layers.svg'
	},
	{
		name: 'Tools',
		component: ToolsComponent,
		icon_url: '/assets/icons/tools.svg'
	},
	{
		name: 'Algorithms',
		component: AlgorithmsComponent,
		icon_url: '/assets/icons/algorithms.svg'
	},
	{
		name: 'Settings',
		component: SettingsComponent,
		icon_url: '/assets/icons/settings.svg'
	},
	{
		name: 'Imagery SandBox',
		component: ImagerySandBoxComponent,
		icon_url: '/assets/icons/tools.svg'
	}
];
