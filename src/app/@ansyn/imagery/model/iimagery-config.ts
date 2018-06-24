export interface IMapConfig {
	mapType: string;
	mapSource: string;
	mapSourceMetadata: any;
}

export interface IImageryConfig {
	geoMapsInitialMapSource: IMapConfig[];
	maxCachedLayers: number;
}
export const initialImageryConfig: IImageryConfig = {
	geoMapsInitialMapSource: [],
	maxCachedLayers: 100
}
