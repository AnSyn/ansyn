import { InjectionToken } from '@angular/core';
import { IBingMapsConfig } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-BING-source-provider';
import { IESRI4326Config } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers-ESRI-4326-source-provider';

export interface IMapSourceProvidersConfig {
	[key: string]: IBingMapsConfig | IESRI4326Config | any;
}

export const MAP_SOURCE_PROVIDERS_CONFIG = new InjectionToken('MAP_SOURCE_PROVIDERS_CONFIG');
