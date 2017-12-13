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
import { AnsynLogger } from '@ansyn/core/utils/ansyn-logger';

export const getProviders = (conf): any[] => {
	return [
		{
			provide: IdahoOverlaysSourceConfig,
			useValue: {
				baseUrl: conf.overlaysConfig.baseUrl,
				overlaysByTimeAndPolygon: conf.overlaysConfig.overlaysByTimeAndPolygon,
				defaultApi: conf.overlaysConfig.defaultApi
			}
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
		}
	];
};

export const fetchConfigProviders = fetch('/assets/config/app.config.json')
	.then(response => response.json())
	.then(conf => {
		AnsynLogger.init(conf.loggerConfig.env);
		return conf
	})
	.then(conf => {
		if (conf.production) {
			enableProdMode();
		}
		return conf;
	})
	.then(getProviders);
