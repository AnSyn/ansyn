import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { ContextConfig } from '@ansyn/context';
import { ConfigurationToken } from '@ansyn/imagery/configuration.token';
import { OverlaysConfig } from '@ansyn/overlays/services/overlays.service';
import { toolsConfig } from '@ansyn/menu-items/tools/models/tools-config';
import { layersConfig } from '@ansyn/menu-items/layers-manager/services/data-layers.service';
import { filtersConfig } from '@ansyn/menu-items/filters/services/filters.service';
import { casesConfig } from '@ansyn/menu-items/cases/services/cases.service';
import { IdahoOverlaysSourceConfig } from './app/app-providers/overlay-source-providers/idaho-source-provider';
import { LoginConfig } from '@ansyn/login';
import { enableProdMode } from '@angular/core';
import { mapFacadeConfig } from '@ansyn/map-facade/models/map-facade.config';

const getProviders = (conf): any[] => {
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
		}
	];
};

const bootstrapApplicationModule = (): void => {
	fetch('/assets/config/app.config.json')
		.then(response => response.json())
		.then(conf => {
			if (conf.production) {
				enableProdMode();
			}
			return conf;
		})
		.then(getProviders)
		.then(providers => {
			return platformBrowserDynamic(providers).bootstrapModule(AppModule);
		});
};

bootstrapApplicationModule();
