import { defaultCase } from './cases/default_case';
import { AppSettings } from "../app/app-models/settings";
// export function appSettings(): AppSettings {
// 	return <AppSettings>window['settings'];
// }

// export const config: AppSettings = appSettings();

export const configuration = {
	env: 'default',
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
