import {
	CacheService,
	ImageryCommunicatorService,
	ImageryMapSource, IMapSettings,
	IMapSourceProvidersConfig,
	MAP_SOURCE_PROVIDERS_CONFIG
} from '@ansyn/imagery';
import Projection from 'ol/proj/Projection';
import Static from 'ol/source/ImageStatic';
import ImageLayer from 'ol/layer/Image';
import { Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OpenLayersMap } from '../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from '../maps/openlayers-disabled-map/openlayers-disabled-map';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';

export const OpenLayerPic4CartoSourceProviderSourceType = 'PIC4CARTO';

@ImageryMapSource({
	sourceType: OpenLayerPic4CartoSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayerPic4CartoSourceProvider extends OpenLayersMapSourceProvider {
	readonly sourceType;

	constructor(
		protected cacheService: CacheService,
		protected imageryCommunicatorService: ImageryCommunicatorService,
		@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig,
		protected http: HttpClient
	) {
		super(cacheService, imageryCommunicatorService, mapSourceProvidersConfig);
	}

	create(metaData: IMapSettings): Promise<any> {
		return new Promise(resolve => {
			const image = new Image();

			image.onload = () => {
				const extent: any = [0, 0, image.width, image.height];

				const source = new Static({
					url: metaData.data.overlay.imageUrl,
					crossOrigin: null,
					projection: new Projection({
						code: metaData.data.overlay.id,
						units: 'pixels',
						extent
					}),
					imageExtent: extent
				});

				resolve(
					new ImageLayer({
						source,
						extent
					})
				);
			};

			image.src = metaData.data.overlay.imageUrl;
		});
	}

	setExtraData(layer, extraData) {
		if (layer && layer.set) {
			return super.setExtraData(layer, extraData);
		}
		return;
	}
}
