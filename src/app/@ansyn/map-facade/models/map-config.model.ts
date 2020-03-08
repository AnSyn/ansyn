export interface IEd50Notification {
	href?: string;
	title: string;
	hrefText?: string;
}

export interface IMapSearchConfig {
	active: boolean;
	url: string;
	apiKey: string;
}

export interface IMapFacadeConfig {
	displayDebounceTime: number;
	overlayCoverage: number;
	disableBestResolutionContextMenu: boolean;
	sensorTypeShortcuts: Object;
	contextMenu: {
		filterField: string;
	};
	mapSearch: IMapSearchConfig;
	welcomeNotification: {
		headerText: string;
		mainText: string;
	};
	floatingPositionSuffix?: string;
	floatingPositionSystem?: 'WGS84' | 'UTM',
	Proj4: {
		ed50: string;
		ed50Customized: string;
		ed50Notification: IEd50Notification;
	},
}


