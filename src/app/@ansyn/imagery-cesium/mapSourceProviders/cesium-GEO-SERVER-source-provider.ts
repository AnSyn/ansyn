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

export const CesiumGeoServerSourceProviderSourceType = 'CESIUM_GEO_SERVER';

@ImageryMapSource({
	supported: [CesiumMap],
	sourceType: CesiumGeoServerSourceProviderSourceType
})
export class CesiumGeoServerSourceProvider extends BaseMapSourceProvider {
	readonly supported: IBaseImageryMapConstructor[];

	constructor(protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig) {
		super(cacheService, imageryCommunicatorService, mapSourceProvidersConfig);
	}

	protected create(metaData: IMapSettings): Promise<IBaseImageryLayer> {
		const config = {...this.config, ...metaData.data.config};
		const layers = config.layers.join(',');
		const cesiumGeoServerLayer = new Cesium.WebMapServiceImageryProvider({
			url: config.url,
			layers: layers
		});
		const layer = new CesiumLayer(cesiumGeoServerLayer);
		return Promise.resolve(layer);
	}
}
