// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { defaultCase } from './cases/default_case';
import { AppSettings } from "../app/app-models/settings";


export function appSettings(): AppSettings {
	return <AppSettings>window['settings'];
}

export const config: AppSettings = appSettings();

export const configuration = {
	env: 'dev',
	production: false,
	MetaConfig: {

	},
	General: {
		logActions: false
	},
	CasesConfig: config.casesConfig,
	LayersManagerConfig: config.layersManagerConfig,
	OverlaysConfig: config.overlaysConfig,
	ImageryConfig: config.imageryConfig,
	ContextConfig: config.contextConfig,
	FiltersConfig: config.filtersConfig,
	ToolsConfig: config.toolsConfig
};
