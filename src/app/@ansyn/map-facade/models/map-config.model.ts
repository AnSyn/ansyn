export interface IMapSearchConfig {
	active: boolean;
	url: string;
	apiKey: string;
}

export interface IMapFacadeConfig {
	overlayCoverage: number;
	sensorTypeShortcuts: Object;
	contextMenu: {
		filterField: string;
	};
	mapSearch: IMapSearchConfig;
}


