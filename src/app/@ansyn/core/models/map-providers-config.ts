export interface IMapProvidersConfig {
	[key: string]: {
		defaultMapSource: string
	};
}

export const MAP_PROVIDERS_CONFIG = 'mapProvidersConfig';
