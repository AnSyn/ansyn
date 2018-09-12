import { CasesComponent } from '@ansyn/menu-items/cases/components/cases/cases.component';
import { FiltersCollectionComponent } from '@ansyn/menu-items/filters/components/filters-collection/filters-collection.component';
import { LayersManagerComponent } from '@ansyn/menu-items/layers-manager/components/layers-manager/layers-manager.component';
import { ToolsComponent } from '@ansyn/menu-items/tools/tools/tools.component';
import { AlgorithmsComponent } from '@ansyn/menu-items/algorithms/algorithms/algorithms.component';
import { SettingsComponent } from '@ansyn/menu-items/settings/settings/settings.component';
import { HelpComponent } from '@ansyn/menu-items/help/components/help.component';

export const constConfiguration = {
	production: false,
	coreConfig: {
		needToUseLayerExtent: false
	},
	configPath: 'assets/config/app.config.json',
	overlaysConfig: {
		overlayOverviewFailed: 'assets/icons/preview-failed-to-find-overlay-preview.svg'
	},
	menuConfig: {
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
				name: 'Algorithms',
				component: AlgorithmsComponent,
				iconClass: 'icon-main-algorithms'
			},
			{
				name: 'Settings',
				component: SettingsComponent,
				iconClass: 'icon-main-settings'
			},
			{
				name: 'Help',
				component: HelpComponent,
				iconClass: 'icon-help-settings'
			}
		]
	}
};
