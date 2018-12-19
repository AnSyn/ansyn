import {
	CasesComponent,
	FiltersCollectionComponent, HelpComponent,
	LayersManagerComponent, SettingsComponent,
	TasksComponent,
	ToolsComponent
} from '@ansyn/menu-items';
import { UploadsComponent } from './uploads/components/uploads/uploads.component';

export const droneMenuItems = [{
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
	name: 'Uploads',
		component: UploadsComponent,
	iconClass: 'icon-layer-export'
},
{
	name: 'Help',
		component: HelpComponent,
	iconClass: 'icon-help-settings'
}]
