import { OpenLayersDisabledMap, OpenLayersMap } from '@ansyn/plugins';
import { CacheService, ImageryCommunicatorService, ImageryMapSource } from '@ansyn/imagery';
import {
	ErrorHandlerService,
	ICaseMapState,
	IMapSourceProvidersConfig,
	MAP_SOURCE_PROVIDERS_CONFIG
} from '@ansyn/core';
import Projection from 'ol/proj/projection';
import Static from 'ol/source/imagestatic';
import ImageLayer from 'ol/layer/image';
import proj from 'ol/proj';
import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';
import { ITBConfig } from '../overlay-source-provider/tb.model';
import { OpenLayersMapSourceProvider } from '@ansyn/ansyn';
import { createTransform, FROMCOORDINATES, FROMPIXEL } from './transforms';
import TileWMS from "ol/source/tilewms";
import TileLayer from "ol/layer/tile";


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

	createAsync(metaData: ICaseMapState): any {
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
				projection
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

			const imageLayer = new ImageLayer({
				source,
				extent
			});
			return this.addFootprintToLayerPromise(Promise.resolve(imageLayer), metaData);

		} else {
			console.log('start open-layers for GeoTiff...');
			console.log(`url: ${metaData.data.overlay.imageUrl}`);
			console.log(`LAYERS: ${metaData.data.overlay.tag.geoserver.resource.name}`);
			console.log(`projection: ${metaData.data.overlay.tag.data.srs}`);

			const source = new TileWMS(<any>{
				preload: Infinity,
				url: metaData.data.overlay.imageUrl,
				params: {
					'VERSION': '1.1.0',
					LAYERS: metaData.data.overlay.tag.geoserver.resource.name
				},
				projection: metaData.data.overlay.tag.data.srs
			});

			const tiled = new TileLayer({ visible: true, source });
			return [tiled];
		}
	}
}
