import {
	IBaseImageryLayer,
	BaseMapSourceProvider,
	IBaseImageryMapConstructor,
	ImageryMapSource,
	IMapSettings, CacheService, ImageryCommunicatorService, MAP_SOURCE_PROVIDERS_CONFIG, IMapSourceProvidersConfig
} from '@ansyn/imagery';
import { CesiumMap } from '../maps/cesium-map/cesium-map';
import { CesiumLayer } from '../models/cesium-layer';
import { Inject } from '@angular/core';

declare const Cesium: any;

export const CesiumOSMSourceProviderSourceType = 'CESIUM_OSM';

@ImageryMapSource({
	supported: [CesiumMap],
	sourceType: CesiumOSMSourceProviderSourceType
})
export class CesiumOsmSourceProvider extends BaseMapSourceProvider {
	readonly supported: IBaseImageryMapConstructor[];

	constructor(protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig) {
		super(cacheService, imageryCommunicatorService, mapSourceProvidersConfig);
	}

	protected create(metaData: IMapSettings): Promise<IBaseImageryLayer> {
		const cesiumOsmLayer = new Cesium.OpenStreetMapImageryProvider({
			url : 'https://a.tile.openstreetmap.org/'
		});
		const layer = new CesiumLayer(cesiumOsmLayer);
		return Promise.resolve(layer);
	}
}
