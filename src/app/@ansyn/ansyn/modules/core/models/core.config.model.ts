import { IStorageConfig } from '../services/storage/config';

export interface ICoreConfig {
	storageService: IStorageConfig;
	noInitialSearch?: boolean;
	httpTimeout: number;
	isFooterCollapsible: boolean;
}
