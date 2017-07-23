import {InjectionToken} from '@angular/cli';
import { Case } from "@ansyn/core";
import { IOverlaysConfig } from '@ansyn/overlays';

export const AppSettingsToken: InjectionToken = new InjectionToken("app-settings");

export class AppSettings  {
    casesConfig: CasesConfig;
    layersManagerConfig: LayersManagerConfig;
    overlaysConfig: OverlaysConfig;
    contextConfig: ContextConfig;
	imageryConfig: ImageryConfig;
	filtersConfig: FiltersConfig;
	toolsConfig: ToolsConfig;
}


export class CasesConfig {
		baseUrl: string;
		paginationLimit: number;
		defaultCase: Case;
		casesQueryParamsKeys: Array<string>;
		updateCaseDebounceTime: number;
		useHash: boolean;
    }
    
export class LayersManagerConfig {
		layersByCaseIdUrl: string;
    };
    
export class OverlaysConfig implements IOverlaysConfig {
		baseUrl: string;
		overlaysByCaseId: string;
		overlaysByTimeAndPolygon: string;
		defaultApi: string;
		searchByCase: boolean;
		overlaySource: string;
		polygonGenerationDisatnce: number;
	};
	
export class FiltersConfig {
		filters: Array<{
			modelName: string,
			displayName: string,
			type: 'Enum'}
			>;
	};
    
export class ContextConfig {
		contextSources: Array<{
                type: string;
			    uri: string;
			    bucket: string;
			    available: boolean;
			    log?: string;
			    auth?: string}>;
    };

export class ImageryConfig {
		geoMapsInitialMapSource: Array<{
			mapType: string;
			mapSource: string;
			mapSourceMetadata: { 
                key: string;
                styles: Array<string>
            }}>;
    };

export class ToolsConfig {
	GoTo: {
		from: {
			datum: string;
			projection: string;
		},
		to: {
			datum: string;
			projection: string;
		}
	}
}