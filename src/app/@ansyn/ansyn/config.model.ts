import { IAlgorithmsConfig, ICasesConfig, IFiltersConfig, ILayersManagerConfig, IToolsConfig } from '@ansyn/menu-items';
import { IOverlaysConfig } from '@ansyn/overlays';
import { IMapFacadeConfig } from '@ansyn/map-facade';
import {
	ICoreConfig,
	ILoggerConfig,
	IMapSourceProvidersConfig,
	IMultipleOverlaysSourceConfig
} from '@ansyn/core';
import { IStatusBarConfig } from '@ansyn/status-bar';
import { IMenuConfig } from '@ansyn/menu';
import { IContextConfig } from '@ansyn/context';
import { IVisualizersConfig } from '@ansyn/imagery';
import { IOpenAerialOverlaySourceConfig } from './app-providers/overlay-source-providers/open-aerial-source-provider';
import { IPlanetOverlaySourceConfig } from './app-providers/overlay-source-providers/planet/planet-source-provider';
import { IIdahoOverlaySourceConfig } from './app-providers/overlay-source-providers/idaho-source-provider';
import { IAirbusOverlaySourceConfig } from "./app-providers/overlay-source-providers/airbus-source-provider";

export interface IConfigModel {
	casesConfig: ICasesConfig,
	layersManagerConfig: ILayersManagerConfig,
	overlaysConfig: IOverlaysConfig,
	mapFacadeConfig: IMapFacadeConfig,
	mapSourceProvidersConfig: IMapSourceProvidersConfig,
	filtersConfig: IFiltersConfig,
	contextConfig: IContextConfig,
	toolsConfig: IToolsConfig,
	loggerConfig: ILoggerConfig,
	statusBarConfig: IStatusBarConfig,
	coreConfig: ICoreConfig,
	menuConfig: IMenuConfig,
	visualizersConfig: IVisualizersConfig,
	multipleOverlaysSourceConfig: IMultipleOverlaysSourceConfig,
	idahoOverlaysSourceConfig: IIdahoOverlaySourceConfig,
	openAerialOverlaysSourceConfig: IOpenAerialOverlaySourceConfig,
	airbusOverlaysSourceConfig: IAirbusOverlaySourceConfig,
	planetOverlaysSourceConfig: IPlanetOverlaySourceConfig,
	ORIENTATIONS: string[],
	algorithmsConfig: IAlgorithmsConfig
}
