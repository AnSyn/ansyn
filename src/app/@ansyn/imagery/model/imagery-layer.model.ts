export interface IBaseImageryLayer {
	get(key: any): any;
	set(key: any, value: any): void;
	[key: string]: any;
}

export enum ImageryLayerProperties {
	NAME = 'name',
	ID = 'id',
	FROM_CACHE = 'fromCache',
	CACHE_ID = 'cacheId',
	MAIN_EXTENT = 'mainExtent',
	FOOTPRINT = 'footprint',
	DESCRIPTION = 'description'
}

export const IMAGERY_MAIN_LAYER_NAME = 'main';

export const IMAGERY_BASE_MAP_LAYER = 'base_map_layer';

