export interface IImageryConfig {
	maxCachedLayers: number;
	stayInImageryVerticalPadding: number;
}

export const initialImageryConfig: IImageryConfig = {
	maxCachedLayers: 20,
	stayInImageryVerticalPadding: 35
};
