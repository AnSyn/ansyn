export interface IMapSource {
	key: string;
	displayName: string;
	thumbnail: string;
	sourceType: string;
	config: {
		[key: string]: any
	}
}

export interface IMapProviderConfig {
	defaultMapSource: string;
	sources: IMapSource[];
}

export interface IMapProvidersConfig {
	[key: string]: IMapProviderConfig;
}

export const MAP_PROVIDERS_CONFIG = 'mapProvidersConfig';
