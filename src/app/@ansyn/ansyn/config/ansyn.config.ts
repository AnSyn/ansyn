import { IMenuItem } from '@ansyn/menu';
import { IAlert } from '../modules/alerts/alerts.model';
import { LayersManagerComponent } from '../modules/menu-items/layers-manager/components/layers-manager/layers-manager.component';
import { anaglyphSensorAlertKey } from '../modules/plugins/openlayers/plugins/anaglyph-sensor/plugin/anaglyph-sensor.plugin';
import { AnaglyphSensorAlertComponent } from '../modules/plugins/openlayers/plugins/anaglyph-sensor/alert-component/anaglyph-sensor-alert.component';
import { ResultsTableComponent } from '../modules/menu-items/results/components/results-table/results-table.component';
import { CasesContainerComponent } from '../modules/menu-items/cases/components/cases-container/cases-container.component';

export enum MenuItemsKeys {
	DataLayers = 'Data Layers',
	ResultsTable = 'Results table',
	Cases = 'Cases'
}

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
			name: MenuItemsKeys.DataLayers,
			component: LayersManagerComponent
		},
		{
			name: MenuItemsKeys.ResultsTable,
			component: ResultsTableComponent
		},
		{
			name: MenuItemsKeys.Cases,
			component: CasesContainerComponent
		}
	]
};
