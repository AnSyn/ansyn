import { IMapFacadeConfig } from '@ansyn/map-facade';
import { IMenuConfig } from '@ansyn/menu';
import { IMapProvidersConfig, IMapSourceProvidersConfig, IVisualizersConfig } from '@ansyn/imagery';
import { IOpenAerialOverlaySourceConfig } from './app-providers/overlay-source-providers/open-aerial-source-provider';
import { IPlanetOverlaySourceConfig } from './app-providers/overlay-source-providers/planet/planet-source-provider';
import { IIdahoOverlaySourceConfig } from './app-providers/overlay-source-providers/idaho-source-provider';
import { ICasesConfig } from '../../app/cases/models/cases-config';
import { ILayersManagerConfig } from './modules/menu-items/layers-manager/models/layers-manager-config';
import { IOverlaysConfig } from './modules/overlays/models/overlays.config';
import { IFiltersConfig } from './modules/menu-items/filters/models/filters-config';
import { IToolsConfig } from './modules/menu-items/tools/models/tools-config';
import { ILoggerConfig } from './modules/core/models/logger-config.model';
import { IStatusBarConfig } from './modules/status-bar/models/statusBar-config.model';
import { ICoreConfig } from './modules/core/models/core.config.model';
import { IMultipleOverlaysSourceConfig } from './modules/core/models/multiple-overlays-source-config';
import { IAlgorithmsConfig } from './modules/menu-items/algorithms/models/tasks.model';

export interface IConfigModel {
	casesConfig: ICasesConfig,
	layersManagerConfig: ILayersManagerConfig,
	overlaysConfig: IOverlaysConfig,
	mapFacadeConfig: IMapFacadeConfig,
	mapProvidersConfig: IMapProvidersConfig,
	mapSourceProvidersConfig: IMapSourceProvidersConfig,
	filtersConfig: IFiltersConfig,
	/* @todo: move to app */
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
