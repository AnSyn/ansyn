import { IStorageConfig } from "../services/storage/config";

export interface IMapSearchConfig {
	active: boolean;
	url: string;
	apiKey: string;
}

export interface ICoreConfig {
	storageService: IStorageConfig;
	welcomeNotification: {
		headerText: string;
		mainText: string;
	};
	mapSearch: IMapSearchConfig;
}
