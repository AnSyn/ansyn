
export interface IMapProviderConfig {
		defaultMapSource: string
}

export interface IMapProvidersConfig {
	[key: string]: IMapProviderConfig;
}

export const MAP_PROVIDERS_CONFIG = 'mapProvidersConfig';
