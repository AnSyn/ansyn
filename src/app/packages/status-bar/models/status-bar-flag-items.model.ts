export type StatusBarFlag = 'PIN_POINT_INDICATOR' | 'PIN_POINT_SEARCH' | 'GEO_REGISTERED_OPTIONS_ENABLED';

export const statusBarFlagsItems: { [key: string]: StatusBarFlag } = {
	pinPointIndicator: 'PIN_POINT_INDICATOR',
	pinPointSearch: 'PIN_POINT_SEARCH',
	geoRegisteredOptionsEnabled: 'GEO_REGISTERED_OPTIONS_ENABLED'
};
