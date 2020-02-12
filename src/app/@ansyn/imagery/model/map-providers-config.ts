export interface IMapProviderConfig {
	defaultMapSource: string;
	sources: any;
}

export interface IMapProvidersConfig {
	[key: string]: IMapProviderConfig;
}

export const MAP_PROVIDERS_CONFIG = 'mapProvidersConfig';
