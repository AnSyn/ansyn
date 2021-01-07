import { IMenuItem } from '@ansyn/menu';
import { IAlert } from '../modules/alerts/alerts.model';
import { LayersManagerComponent } from '../modules/menu-items/layers-manager/components/layers-manager/layers-manager.component';
import { SettingsComponent } from '../modules/menu-items/settings/settings/settings.component';
import { TasksComponent } from '../modules/menu-items/algorithms/components/tasks/tasks.component';
import { anaglyphSensorAlertKey } from '../modules/plugins/openlayers/plugins/anaglyph-sensor/plugin/anaglyph-sensor.plugin';
import { AnaglyphSensorAlertComponent } from '../modules/plugins/openlayers/plugins/anaglyph-sensor/alert-component/anaglyph-sensor-alert.component';
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
			key: anaglyphSensorAlertKey,
			component: AnaglyphSensorAlertComponent
		}
	],
	ansynMenuItems: [
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
			name: 'Algorithms',
			component: TasksComponent,
			iconClass: 'icon-main-algorithms'
		},
		{
			name: 'Settings',
			component: SettingsComponent,
			iconClass: 'icon-main-settings'
		}
	]
};
