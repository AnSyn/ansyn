import { OpenLayersDisabledMap, OpenLayersMap } from '@ansyn/plugins';
import { CacheService, ImageryCommunicatorService, ImageryMapSource } from '@ansyn/imagery';
import { ErrorHandlerService, ICaseMapState } from '@ansyn/core';
import Projection from 'ol/proj/projection';
import Static from 'ol/source/imagestatic';
import ImageLayer from 'ol/layer/image';
import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';
import { ITBConfig } from '../overlay-source-provider/tb.model';
import { IMapSourceProvidersConfig, MAP_SOURCE_PROVIDERS_CONFIG } from '@ansyn/core';
import { OpenLayersMapSourceProvider } from '@ansyn/ansyn';

export const OpenLayerTBSourceProviderSourceType = 'TB';

@ImageryMapSource({
	sourceType: OpenLayerTBSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap],
	forOverlay: true
})
export class OpenLayerTBSourceProvider extends OpenLayersMapSourceProvider<ITBConfig> {

	constructor(
		protected cacheService: CacheService,
		protected imageryCommunicatorService: ImageryCommunicatorService,
		@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig,
		protected errorHandlerService: ErrorHandlerService,
		protected http: HttpClient) {
		super(cacheService, imageryCommunicatorService, mapSourceProvidersConfig);
	}

	createAsync(metaData: ICaseMapState): Promise<any> {
		const extent: any = [0, 0, metaData.data.overlay.tag.imageData.ExifImageWidth, metaData.data.overlay.tag.imageData.ExifImageHeight];

		const source = new Static({
			url: metaData.data.overlay.imageUrl,
			crossOrigin: null,
			projection: new Projection({
				code: 'tb-image',
				units: 'pixels',
				extent
			}),
			imageExtent: extent
		});
		const imageLayer = new ImageLayer({
			source,
			extent
		});
		return Promise.resolve(imageLayer);
	}
}
