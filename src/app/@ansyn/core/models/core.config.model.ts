import { IStorageConfig } from "../services/storage/config";

export interface ICoreConfig {
	welcomeNotification: {
		headerText: string;
		mainText: string;
	};
}

export interface ICoreConfig {
	storageService: IStorageConfig;
}
