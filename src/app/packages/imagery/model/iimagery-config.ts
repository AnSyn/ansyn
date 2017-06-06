/**
 * Created by AsafMas on 06/06/2017.
 */
export interface IMapConfig {
	mapType: string;
	mapSource: string;
	mapSourceMetadata: any;
}

export interface IImageryConfig {
	geoMapsInitialMapSource: IMapConfig[];
}
