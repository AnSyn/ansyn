import { ContextConfig } from '@ansyn/context';
import { ConfigurationToken } from '@ansyn/imagery/configuration.token';
import { OverlaysConfig } from '@ansyn/overlays/services/overlays.service';
import { toolsConfig } from '@ansyn/menu-items/tools/models/tools-config';
import { layersConfig } from '@ansyn/menu-items/layers-manager/services/data-layers.service';
import { filtersConfig } from '@ansyn/menu-items/filters/services/filters.service';
import { casesConfig } from '@ansyn/menu-items/cases/services/cases.service';
import { LoginConfig } from '@ansyn/login';
import { enableProdMode } from '@angular/core';
import { mapFacadeConfig } from '@ansyn/map-facade/models/map-facade.config';
import { IdahoOverlaysSourceConfig } from './overlay-source-providers/idaho-source-provider';
import { VisualizersConfig } from '@ansyn/core/tokens/visualizers-config.token';
import { MultipleOverlaysSourceConfig } from './overlay-source-providers/multiple-source-provider';
import { LoggerConfig } from '@ansyn/core/models/logger.config';
import { StatusBarConfig } from '@ansyn/status-bar/models/statusBar.config';
import { MenuConfig } from '@ansyn/menu/models/menuConfig';
import { CoreConfig } from '@ansyn/core';

export const getProviders = (conf): any[] => {
	return [
		{
			provide: IdahoOverlaysSourceConfig,
			useValue: conf.idahoOverlaysSourceConfig
		},
		{
			provide: casesConfig,
			useValue: conf.casesConfig
		},
		{
			provide: filtersConfig, useValue: conf.filtersConfig
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
			provide: ConfigurationToken,
			useValue: conf.imageryConfig
		},
		{
			provide: ContextConfig,
			useValue: conf.contextConfig
		},
		{
			provide: LoginConfig,
			useValue: conf.loginConfig
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
		}

	];
};

export const fetchConfigProviders = () => fetch('/assets/config/app.config.json')
	.then(response => response.json())
	.then(conf => {
		if (conf.production) {
			enableProdMode();
		}
		return conf;
	})
	.then(getProviders)
