import { IMenuItem } from '@ansyn/menu';
import { OverlayOutOfBoundsComponent } from '../components/overlay-out-of-bounds/overlay-out-of-bounds.component';
import { IAlert } from '../modules/alerts/alerts.model';
import { CasesComponent } from '../modules/menu-items/cases/components/cases/cases.component';
import { LayersManagerComponent } from '../modules/menu-items/layers-manager/components/layers-manager/layers-manager.component';
import { ToolsComponent } from '../modules/menu-items/tools/tools/tools.component';
import { SettingsComponent } from '../modules/menu-items/settings/settings/settings.component';
import { HelpComponent } from '../modules/menu-items/help/components/help.component';
import { TasksComponent } from '../modules/menu-items/algorithms/components/tasks/tasks.component';
import { anaglyphSensorAlertKey } from '../modules/plugins/openlayers/plugins/anaglyph-sensor/plugin/anaglyph-sensor.plugin';
import { AnaglyphSensorAlertComponent } from '../modules/plugins/openlayers/plugins/anaglyph-sensor/alert-component/anaglyph-sensor-alert.component';
import { CredentialsComponent } from '../modules/core/components/credentials/credentials.component';
import { ResultsComponent } from "../modules/menu-items/results/components/results/results.component";
import { FiltersCollectionComponent } from '../modules/filters/components/filters-collection/filters-collection.component';

export const ansynConfig: { ansynAlerts: IAlert[], ansynMenuItems: IMenuItem[] } = {
	ansynAlerts: [
		{
			key: 'noGeoRegistration',
			background: '#a70b0b',
			text: 'This Image Has No Geo-Registration'
		},
		{
			key: 'overlayIsNotPartOfQuery',
			background: '#9ca9b3',
			text: 'This Overlay Is Not a Part of the Query'
		},
		{
			key: 'overlaysOutOfBounds',
			component: OverlayOutOfBoundsComponent
		},
		{
			key: anaglyphSensorAlertKey,
			component: AnaglyphSensorAlertComponent
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
			name: 'Results table',
			component: ResultsComponent,
			iconClass: 'icon-table'
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
			iconClass: 'icon-main-help'
		},
		{
			name: 'Permissions',
			component: CredentialsComponent,
			iconClass: 'icon-credentials',
			dockedToBottom: true
		}
	]
};
