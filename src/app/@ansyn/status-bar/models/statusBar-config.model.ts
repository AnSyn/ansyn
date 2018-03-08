export interface IToolTipsConfig {
	orientation?: string,
	geoFilter?: string,
	geoFilterEdit?: string,
	geoFilterShow?: string,
	timeFilter ?: string,
	timeFilterEdit?: string,
	screenNumber?: string,
	imageCount?: string,
	backwards?: string,
	forward?: string,
	reset?: string,
	enlarge?: string
}

export interface IStatusBarConfig {
	toolTips: IToolTipsConfig
}
