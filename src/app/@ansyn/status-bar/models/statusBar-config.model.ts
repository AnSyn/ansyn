import { TreeviewItem } from 'ngx-treeview';

export interface IToolTipsConfig {
	orientation?: string,
	geoFilter?: string,
	geoFilterEdit?: string,
	geoFilterShow?: string,
	dataInputFilter?: string,
	timeFilter?: string,
	timeFilterEdit?: string,
	screenNumber?: string,
	overlayCount?: string,
	backwards?: string,
	forward?: string,
	reset?: string,
	enlarge?: string,
	quickloop?: string
}

export interface IDataInputItem {
	inActive?: boolean;
	treeViewItem: TreeviewItem;
}

export interface IDataInputFiltersConfig {
	[providerName: string]: IDataInputItem;
}

export interface IStatusBarConfig {
	toolTips: IToolTipsConfig,
	dataInputFiltersConfig: IDataInputFiltersConfig
}
