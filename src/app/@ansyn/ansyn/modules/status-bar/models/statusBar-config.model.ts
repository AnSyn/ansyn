import { IResolutionRange } from "../../overlays/models/overlay.model";

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
	quickloop?: string,
	share?: string
}

export interface IFilterStatusBar {
	filterNames: string[],
	maximumOpen: number

}
export interface IAdvancedSearchParameter {
	types?: string[];
	registeration?: string[];
	providers?: string[];
	resolution?: IResolutionRange;
}

export interface IStatusBarConfig {
	toolTips: IToolTipsConfig,
	filters: IFilterStatusBar
	locale: string
	advancedSearchParameters: IAdvancedSearchParameter
}
