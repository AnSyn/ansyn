import { IStorageConfig } from "../services/storage/config";

export interface ICoreConfig {
	storageService: IStorageConfig;
	welcomeNotification: {
		headerText: string;
		mainText: string;
	};
}
