import {
	BaseMapSourceProvider,
	CacheService,
	IBaseImageryLayer,
	ImageryCommunicatorService,
	ImageryMapSource,
	IMapSettings,
	IMapSourceProvidersConfig,
	MAP_SOURCE_PROVIDERS_CONFIG
} from '@ansyn/imagery';
import { ImageryVideoMap } from '../map/imagery-video-map';
import { Inject } from '@angular/core';

export const IMAGERY_VIDEO_SOURCE_TYPE = 'IMAGERY_VIDEO';

@ImageryMapSource({
	sourceType: IMAGERY_VIDEO_SOURCE_TYPE,
	supported: [ImageryVideoMap]
})
export class ImageryVideoProvider extends BaseMapSourceProvider {
	constructor(protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig) {
		super(cacheService, imageryCommunicatorService, mapSourceProvidersConfig);
	}

	public create(metaData: IMapSettings): Promise<IBaseImageryLayer> {
		// Add the metadata to a JS Map object, to obtain the required set() and get() methods
		const mapLikeLayer = Object.assign(new Map(), metaData);
		return Promise.resolve(mapLikeLayer);
	}
}
