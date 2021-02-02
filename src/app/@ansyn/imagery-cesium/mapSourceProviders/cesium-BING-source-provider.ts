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

export const CesiumBingSourceProviderSourceType = 'CESIUM_BING';

@ImageryMapSource({
	sourceType: CesiumBingSourceProviderSourceType,
	supported: [CesiumMap]
})
export class CesiumBINGSourceProvider extends BaseMapSourceProvider {
	readonly supported: IBaseImageryMapConstructor[];

	constructor(protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig) {
		super(cacheService, imageryCommunicatorService, mapSourceProvidersConfig);
	}

	protected create(metaData: IMapSettings): Promise<IBaseImageryLayer> {
		const cesiumBingLayer = new Cesium.BingMapsImageryProvider({
			url: 'https://dev.virtualearth.net',
			key: 'Ag9RlBTbfJQMhFG3fxO9fLAbYMO8d5sevTe-qtDsAg6MjTYYFMFfFFrF2SrPIZNq',
			mapStyle: Cesium.BingMapsStyle.AERIAL_WITH_LABELS
		});
		const layer = new CesiumLayer(cesiumBingLayer);
		return Promise.resolve(layer);
	}

}
