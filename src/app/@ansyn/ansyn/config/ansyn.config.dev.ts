import {
	AlgorithmsComponent,
	CasesComponent,
	FiltersCollectionComponent,
	HelpComponent,
	LayersManagerComponent,
	SettingsComponent,
	ToolsComponent
} from '@ansyn/menu-items';
import { IAlert } from '@ansyn/core';
import { IMenuItem } from '@ansyn/menu';

export const ansynConfig: { ansynAlerts: IAlert[], ansynMenuItems: IMenuItem[] } = {
	ansynAlerts: [
		{
			key: 'noGeoRegistration',
			background: '#a70b0b',
			text: 'This Image Has No Geo-Registration'
		},
		{
			key: 'overlayIsNotPartOfQuery',
			background: '#27B2CF',
			text: 'This Overlay Is Not a Part of the Query'
		},
		{
			key: 'overlaysOutOfBounds',
			background: '#80c5d4',
			text: 'Image is out of bounds'
		}
	],
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
};
