import {InjectionToken} from '@angular/cli';
import { Case } from "@ansyn/core";
import { IOverlaysConfig } from '@ansyn/overlays';
import { ICasesConfig } from '@ansyn/menu-items/cases';
import { ILayersManagerConfig } from '@ansyn/menu-items/layers-manager';
import { IContextConfig } from '@ansyn/context';
import { IImageryConfig } from '@ansyn/imagery';
import { IFiltersConfig } from '@ansyn/menu-items/filters';
import { IToolsConfig } from '@ansyn/menu-items/tools';

export const AppSettingsToken: InjectionToken = new InjectionToken("app-settings");

export class AppSettings  {
    production: boolean;
    casesConfig: ICasesConfig;
    layersManagerConfig: ILayersManagerConfig;
    overlaysConfig: IOverlaysConfig;
    contextConfig: IContextConfig;
	imageryConfig: IImageryConfig;
	filtersConfig: IFiltersConfig;
	toolsConfig: IToolsConfig;
}
