export interface IImageryConfig {
	maxCachedLayers: number;
	stayInImageryVerticalPadding: number;
}

export const initialImageryConfig: IImageryConfig = {
	maxCachedLayers: 100,
	stayInImageryVerticalPadding: 35
};
