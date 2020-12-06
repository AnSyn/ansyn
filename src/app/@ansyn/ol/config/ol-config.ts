export const OL_CONFIG = 'olConfig';
export const group_layer = 'group-layer';

export interface IOlConfig {
	needToUseLayerExtent: boolean;
	tilesLoadingDoubleBuffer: {
		debounceTimeInMs: number,
		timeoutInMs: number
	};
}
