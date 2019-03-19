import { IAlgorithmsConfig, ICasesConfig, IFiltersConfig, ILayersManagerConfig, IToolsConfig } from './modules/menu-items/public_api';
import { IOverlaysConfig } from './modules/overlays/public_api';
import { IMapFacadeConfig } from '@ansyn/map-facade';
import {
	ICoreConfig,
	ILoggerConfig, IMapProvidersConfig,
	IMapSourceProvidersConfig,
	IMultipleOverlaysSourceConfig
} from '@ansyn/core';
import { IStatusBarConfig } from './modules/status-bar/public_api';
import { IMenuConfig } from '@ansyn/menu';
import { IVisualizersConfig } from '@ansyn/imagery';
import { IOpenAerialOverlaySourceConfig } from './app-providers/overlay-source-providers/open-aerial-source-provider';
import { IPlanetOverlaySourceConfig } from './app-providers/overlay-source-providers/planet/planet-source-provider';
import { IIdahoOverlaySourceConfig } from './app-providers/overlay-source-providers/idaho-source-provider';

export interface IConfigModel {
	casesConfig: ICasesConfig,
	layersManagerConfig: ILayersManagerConfig,
	overlaysConfig: IOverlaysConfig,
	mapFacadeConfig: IMapFacadeConfig,
	mapProvidersConfig: IMapProvidersConfig,
	mapSourceProvidersConfig: IMapSourceProvidersConfig,
	filtersConfig: IFiltersConfig,
	contextConfig: any,
	toolsConfig: IToolsConfig,
	loggerConfig: ILoggerConfig,
	statusBarConfig: IStatusBarConfig,
	coreConfig: ICoreConfig,
	menuConfig: IMenuConfig,
	visualizersConfig: IVisualizersConfig,
	multipleOverlaysSourceConfig: IMultipleOverlaysSourceConfig,
	idahoOverlaysSourceConfig: IIdahoOverlaySourceConfig,
	openAerialOverlaysSourceConfig: IOpenAerialOverlaySourceConfig,
	planetOverlaysSourceConfig: IPlanetOverlaySourceConfig,
	ORIENTATIONS: string[],
	algorithmsConfig: IAlgorithmsConfig
}
