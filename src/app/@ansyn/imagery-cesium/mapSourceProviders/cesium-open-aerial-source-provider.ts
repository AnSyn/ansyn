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

@ImageryMapSource({
	sourceType: 'OPEN_AERIAL',
	supported: [CesiumMap]
})
export class CesiumOpenAerialSourceProvider extends BaseMapSourceProvider {
	readonly supported: IBaseImageryMapConstructor[];

	constructor(protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig) {
		super(cacheService, imageryCommunicatorService, mapSourceProvidersConfig);
	}

	protected create(metaData: IMapSettings): Promise<IBaseImageryLayer> {
		const openAerialLayer = new Cesium.UrlTemplateImageryProvider({
			url: metaData.data.overlay.imageUrl
		});
		const layer = new CesiumLayer(openAerialLayer);
		return Promise.resolve(layer);
	}
}
