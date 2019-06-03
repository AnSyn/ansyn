export const OL_CONFIG = 'olConfig';

export interface IOlConfig {
	needToUseLayerExtent: boolean;
	tilesLoadingDoubleBuffer: {
		debounceTimeInMs: number,
		timeoutInMs: number
	};
}
