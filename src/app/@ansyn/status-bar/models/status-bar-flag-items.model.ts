export type StatusBarFlag = 'PIN_POINT_INDICATOR' | 'PIN_POINT_SEARCH' | 'POLYGON_SEARCH';

export const statusBarFlagsItems: { [key: string]: StatusBarFlag } = {
	pinPointIndicator: 'PIN_POINT_INDICATOR',
	pinPointSearch: 'PIN_POINT_SEARCH',
	polygonSearch: 'POLYGON_SEARCH',
};
