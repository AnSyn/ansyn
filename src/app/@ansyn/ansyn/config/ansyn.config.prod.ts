import {
	CasesComponent,
	FiltersCollectionComponent,
	HelpComponent,
	LayersManagerComponent,
	ToolsComponent, UploadsComponent
} from '@ansyn/menu-items';
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
			name: 'Uploads',
			component: UploadsComponent,
			iconClass: 'icon-layer-export'
		},
		{
			name: 'Help',
			component: HelpComponent,
			iconClass: 'icon-help-settings'
		}
	]

};
