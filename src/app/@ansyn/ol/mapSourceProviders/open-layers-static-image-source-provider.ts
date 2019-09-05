import {
	CacheService,
	ImageryCommunicatorService,
	ImageryMapSource,
	IMapSettings,
	IMapSourceProvidersConfig,
	MAP_SOURCE_PROVIDERS_CONFIG
} from '@ansyn/imagery';
import Projection from 'ol/proj/Projection';
import Static from 'ol/source/ImageStatic';
import ImageLayer from 'ol/layer/Image';
import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';
import { OpenLayersMap } from '../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from '../maps/openlayers-disabled-map/openlayers-disabled-map';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';

export const OpenLayersStaticImageSourceProviderSourceType = 'STATIC_IMAGE';

@ImageryMapSource({
	sourceType: OpenLayersStaticImageSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayersStaticImageSourceProvider extends OpenLayersMapSourceProvider {

	constructor(
		protected cacheService: CacheService,
		protected imageryCommunicatorService: ImageryCommunicatorService,
		@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig,
		protected http: HttpClient) {
		super(cacheService, imageryCommunicatorService, mapSourceProvidersConfig);
	}

	create(metaData: IMapSettings): Promise<any> {
		const extent: any = [0, 0, metaData.data.overlay.tag.imageData.imageWidth, metaData.data.overlay.tag.imageData.imageHeight];
		const code = `static-image ${ metaData.data.overlay.id }`;

		const projection = new Projection({
			code,
			units: 'pixels',
			extent
		});

		const source = new Static({
			url: metaData.data.overlay.imageUrl,
			crossOrigin: 'Anonymous',
			imageExtent: extent,
			projection
		});

		const layer = new ImageLayer({
			source,
			extent
		});

		return Promise.resolve(layer);
	}

}
