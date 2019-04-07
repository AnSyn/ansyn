import { IStorageConfig } from '../services/storage/config';

export interface ICoreConfig {
	storageService: IStorageConfig;
	noInitialSearch?: boolean;
	translation: {
		default: any,
		[key: string]: any
	};
	needToUseLayerExtent: boolean;
	httpTimeout: number;
	tilesLoadingDoubleBuffer: {
		debounceTimeInMs: number,
		timeoutInMs: number
	};
	floatingPositionSuffix?: string;
}
