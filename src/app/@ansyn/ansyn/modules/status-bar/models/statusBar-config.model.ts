import { BaseOverlaySourceProvider } from "../../overlays/models/base-overlay-source-provider.model";
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

export interface IProviderData {
	name: string;
	class: BaseOverlaySourceProvider;
}
export interface IAdvancedSearchParameter {
	types?: string[];
	registeration?: string[];
	providers?: IProviderData[];
	resolution?: IResolutionRange;
}

export interface IStatusBarConfig {
	toolTips: IToolTipsConfig,
	filters: IFilterStatusBar
	locale: string
	defaultAdvancedSearchParameters: IAdvancedSearchParameter
}
