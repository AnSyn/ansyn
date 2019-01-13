import { OpenLayersDisabledMap, OpenLayersMap, OpenLayersMapSourceProvider } from '@ansyn/plugins';
import { CacheService, ImageryCommunicatorService, ImageryMapSource } from '@ansyn/imagery';
import {
	ICaseMapState,
	IMapSourceProvidersConfig,
	IOverlay,
	MAP_SOURCE_PROVIDERS_CONFIG
} from '@ansyn/core';
import Projection from 'ol/proj/projection';
import Static from 'ol/source/imagestatic';
import ImageLayer from 'ol/layer/image';
import proj from 'ol/proj';
import { Inject } from '@angular/core';
import { ITBConfig } from '../overlay-source-provider/tb.model';
import { createTransform, FROMCOORDINATES, FROMPIXEL } from './transforms';
import TileWMS from 'ol/source/tilewms';
import TileLayer from 'ol/layer/tile';
import { noop } from 'rxjs';

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
		) {
		super(cacheService, imageryCommunicatorService, mapSourceProvidersConfig);
	}
	createAsync(metaData: ICaseMapState): Promise<any> {
		let layer;
		if (metaData.data.overlay.tag.fileType === 'image') {
			const extent: any = [0, 0, metaData.data.overlay.tag.imageData.ExifImageWidth, metaData.data.overlay.tag.imageData.ExifImageHeight];
			const boundary = metaData.data.overlay.tag.geoData.footprint.geometry.coordinates[0];
			const code = `tb-image ${metaData.data.overlay.id}`;
			const transformer = createTransform(code, boundary, extent[2], extent[3]);

			const projection = new Projection({
				code,
				units: 'pixels',
				extent
			});

			const source = new Static({
				url: metaData.data.overlay.imageUrl,
				crossOrigin: null,
				imageExtent: extent,
				projection,
				imageLoadFunction: noop
			});
			proj.addProjection(source.getProjection());
			proj.addCoordinateTransforms(projection, 'EPSG:3857',
				coords => {
					return transformer.EPSG3857(FROMPIXEL, ...coords);

				},
				coords => {
					return transformer.EPSG3857(FROMCOORDINATES, ...coords);
				}
			);

			proj.addCoordinateTransforms(projection, 'EPSG:4326',
				coords => {
					return transformer.EPSG4326(FROMPIXEL, ...coords);
				},
				coords => {
					return transformer.EPSG4326(FROMCOORDINATES, ...coords);
				}
			);

			layer = new ImageLayer({
				source,
				extent
			});
		} else {
			const source = new TileWMS(<any>{
				preload: Infinity,
				url: metaData.data.overlay.imageUrl,
				params: {
					'VERSION': '1.1.0',
					LAYERS: metaData.data.overlay.tag.geoserver.layer.resource.name
				},
				projection: metaData.data.overlay.tag.geoserver.data.srs
			});

			layer = new TileLayer({ visible: true, source });
		}
		return this.addFootprintToLayerPromise(Promise.resolve(layer), metaData);
	}

	getThumbnailName(overlay: IOverlay): string {
		return overlay.name;
	}

}
