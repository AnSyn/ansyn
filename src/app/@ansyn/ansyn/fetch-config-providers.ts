import { OverlaysConfig } from '@ansyn/overlays/services/overlays.service';
import { toolsConfig } from '@ansyn/menu-items/tools/models/tools-config';
import { layersConfig } from '@ansyn/menu-items/layers-manager/services/data-layers.service';
import { filtersConfig } from '@ansyn/menu-items/filters/services/filters.service';
import { casesConfig } from '@ansyn/menu-items/cases/services/cases.service';
import { mapFacadeConfig } from '@ansyn/map-facade/models/map-facade.config';
import { IdahoOverlaysSourceConfig } from './app-providers/overlay-source-providers/idaho-source-provider';
import { VisualizersConfig } from '@ansyn/imagery/model/visualizers-config.token';
import { MultipleOverlaysSourceConfig } from './app-providers/overlay-source-providers/multiple-source-provider';
import { LoggerConfig } from '@ansyn/core';
import { StatusBarConfig } from '@ansyn/status-bar/models/statusBar.config';
import { MenuConfig } from '@ansyn/menu/models/menuConfig';
import { CoreConfig } from '@ansyn/core';
import { ContextConfig } from '@ansyn/context';
import { OpenAerialOverlaysSourceConfig } from './app-providers/overlay-source-providers/open-aerial-source-provider';
import { PlanetOverlaysSourceConfig } from './app-providers/overlay-source-providers/planet/planet-source-provider';
import { MAP_SOURCE_PROVIDERS_CONFIG } from './app-providers/map-source-providers/map-source-providers-config';

export const getProviders = (conf): any[] => {
	return [
		{
			provide: IdahoOverlaysSourceConfig,
			useValue: conf.idahoOverlaysSourceConfig
		},
		{
			provide: OpenAerialOverlaysSourceConfig,
			useValue: conf.openAerialOverlaysSourceConfig
		},
		{
			provide: PlanetOverlaysSourceConfig,
			useValue: conf.planetOverlaysSourceConfig
		},
		{
			provide: casesConfig,
			useValue: conf.casesConfig
		},
		{
			provide: filtersConfig,
			useValue: conf.filtersConfig
		},
		{
			provide: layersConfig,
			useValue: conf.layersManagerConfig
		},
		{
			provide: toolsConfig,
			useValue: conf.toolsConfig
		}, {
			provide: OverlaysConfig,
			useValue: conf.overlaysConfig
		},
		{
			provide: ContextConfig,
			useValue: conf.contextConfig
		},
		{
			provide: mapFacadeConfig,
			useValue: conf.mapFacadeConfig
		},
		{
			provide: VisualizersConfig,
			useValue: conf.visualizersConfig
		},
		{
			provide: MultipleOverlaysSourceConfig,
			useValue: conf.multipleOverlaysSource
		},
		{
			provide: LoggerConfig,
			useValue: conf.loggerConfig
		},
		{
			provide: MenuConfig,
			useValue: conf.menuConfig
		},
		{
			provide: StatusBarConfig,
			useValue: conf.statusBarConfig
		},
		{
			provide: CoreConfig,
			useValue: conf.coreConfig
		},
		{
			provide: MAP_SOURCE_PROVIDERS_CONFIG,
			useValue: conf.mapSourceProvidersConfig
		}
	];
};

export const fetchConfigProviders = (configPath) => fetch(configPath)
	.then(response => response.json())
	.then(getProviders);
