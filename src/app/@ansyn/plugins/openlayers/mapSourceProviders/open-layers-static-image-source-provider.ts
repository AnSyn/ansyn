import { CacheService, ImageryCommunicatorService, ImageryMapSource } from '@ansyn/imagery';
import {
	ErrorHandlerService,
	ICaseMapState,
	IMapSourceProvidersConfig,
	IOverlay,
	MAP_SOURCE_PROVIDERS_CONFIG
} from '@ansyn/core';
import Projection from 'ol/proj/projection';
import Static from 'ol/source/imagestatic';
import ImageLayer from 'ol/layer/image';
import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';
import { OpenLayersMap } from '../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from '../maps/openlayers-disabled-map/openlayers-disabled-map';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';

export const OpenLayersStaticImageSourceProviderSourceType = 'STATIC_IMAGE';

@ImageryMapSource({
	sourceType: OpenLayersStaticImageSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap],
	forOverlay: true
})
export class OpenLayersStaticImageSourceProvider extends OpenLayersMapSourceProvider {

	constructor(
		protected cacheService: CacheService,
		protected imageryCommunicatorService: ImageryCommunicatorService,
		@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig,
		protected errorHandlerService: ErrorHandlerService,
		protected http: HttpClient) {
		super(cacheService, imageryCommunicatorService, mapSourceProvidersConfig);
	}

	createAsync(metaData: ICaseMapState): Promise<any> {
		let layer;
		const extent: any = [0, 0, metaData.data.overlay.tag.imageData.imageWidth, metaData.data.overlay.tag.imageData.imageHeight];
		const code = `static-image ${metaData.data.overlay.id}`;

		const projection = new Projection({
			code,
			units: 'pixels',
			extent
		});

		const source = new Static({
			url: metaData.data.overlay.imageUrl,
			crossOrigin: null,
			imageExtent: extent,
			projection
		});

		layer = new ImageLayer({
			source,
			extent
		});
		return this.addFootprintToLayerPromise(Promise.resolve(layer), metaData);
	}

	getThumbnailName(overlay: IOverlay): string {
		return overlay.name;
	}

}
