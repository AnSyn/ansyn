import {
	TasksComponent,
	CasesComponent,
	FiltersCollectionComponent,
	HelpComponent,
	LayersManagerComponent,
	SettingsComponent,
	ToolsComponent
} from '../modules/menu-items/public_api';
import { IAlert } from '@ansyn/core';
import { IMenuItem } from '@ansyn/menu';
import { OverlayOutOfBoundsComponent } from '../components/overlay-out-of-bounds/overlay-out-of-bounds.component';

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
			component: OverlayOutOfBoundsComponent
		},
		{
			key: 'poorGeoRegistered',
			background: '#cf802a',
			text: 'This Image Has Poor Geo-Registration'
		},
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
			component: TasksComponent,
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
