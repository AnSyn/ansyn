export enum MenuName {
	Cases = 'Cases',
	Filters = 'Filters',
	DataLayers = 'Data Layers',
	Tools = 'Tools',
	Algorithms = 'Algorithms',
	Settings = 'Settings',
	Help = 'Help',
	Permissions = 'Permissions'
}

export interface IMenuItem {
	name: string;
	component: any;
	iconClass: string;
	badge?: number;
	production?: boolean;
	dockedToBottom?: boolean;
}
