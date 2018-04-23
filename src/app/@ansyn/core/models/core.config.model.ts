import { IStorageConfig } from "../services/storage/config";

export interface ICoreConfig {
	storageService: IStorageConfig;
	welcomeNotification: {
		headerText: string;
		mainText: string;
	};
	windowLayout: {
		'menu': boolean,
		'toolsOverMenu': boolean,
		'statusBar': boolean,
		'timeLine': boolean,
		'contextSun': boolean
	}
}
