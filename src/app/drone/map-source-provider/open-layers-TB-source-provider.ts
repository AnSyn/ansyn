import { OpenLayersDisabledMap, OpenLayersMap, OpenLayersMapSourceProvider } from '@ansyn/plugins';
import { CacheService, ImageryCommunicatorService, ImageryMapSource } from '@ansyn/imagery';
import { ICaseMapState, IMapSourceProvidersConfig, IOverlay, MAP_SOURCE_PROVIDERS_CONFIG } from '@ansyn/core';
import Projection from 'ol/proj/Projection';
import Static from 'ol/source/ImageStatic';
import ImageLayer from 'ol/layer/Image';
import * as proj from 'ol/proj';
import { Inject } from '@angular/core';
import { ITBConfig } from '../overlay-source-provider/tb.model';
import { createTransform, FROMCOORDINATES, FROMPIXEL } from './transforms';
import TileWMS from 'ol/source/TileWMS';
import TileLayer from 'ol/layer/Tile';
import WMTSCapabilities from 'ol/format/WMSCapabilities';
import WMTS from 'ol/source/WMTS';
import { noop, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap, catchError } from 'rxjs/operators';

export const OpenLayerTBSourceProviderSourceType = 'TB';

const WMTSCapabilitiesParser = new WMTSCapabilities();

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
		protected http: HttpClient
	) {
		super(cacheService, imageryCommunicatorService, mapSourceProvidersConfig);
	}

	public create(metaData: ICaseMapState): any {
		if (metaData.data.overlay.tag.fileType === 'image') {
			const extent: any = [0, 0, metaData.data.overlay.tag.imageData.ExifImageWidth, metaData.data.overlay.tag.imageData.ExifImageHeight];
			const projection = this.createProjection(metaData.data.overlay);

			const source = new Static({
				url: metaData.data.overlay.imageUrl,
				crossOrigin: null,
				imageExtent: extent,
				projection,
				imageLoadFunction: noop
			});

			return Promise.resolve([new ImageLayer({
				source,
				extent
			})]);
		}
		const projection = this.createDroneTiffProjection(metaData.data.overlay);
		if (metaData.data.overlay.sensorType === 'Awesome Drone Imagery (GeoTIFF)') {
			const source = new TileWMS(<any>{
				url: metaData.data.overlay.imageUrl,
				params: {
					'VERSION': '1.1.0',
					LAYERS: metaData.data.overlay.tag.geoserver.layer.resource.name
				},
				projection
			});
			const extent: any = [0, -metaData.data.overlay.tag.imageData.ExifImageHeight, metaData.data.overlay.tag.imageData.ExifImageWidth, 0];
			const originalTileUrlFunction = (<any>source).tileUrlFunction.bind(source);
			(<any>source).tileUrlFunction = function (...args) {
				const wmsURL = originalTileUrlFunction(...args);
				const start = wmsURL.indexOf('SRS=') + 4;
				const end = wmsURL.indexOf('&', start);
				return `${wmsURL.substring(0, start)}EPSG:32662${wmsURL.substring(end)}`;
			};
			return Promise.resolve([new TileLayer({ visible: true, source, extent })]);
		}

		const source = new TileWMS(<any>{
			url: metaData.data.overlay.imageUrl,
			params: {
				'VERSION': '1.1.1',
				LAYERS: metaData.data.overlay.tag.geoserver.layer.resource.name
			},
			projection
		});
		const { minx, miny, maxx, maxy } = metaData.data.overlay.tag.bbox;
		const extent = proj.transformExtent([minx, miny, maxx, maxy], 'EPSG:4326', 'EPSG:3857');
		return Promise.resolve([new TileLayer({ visible: true, source, extent })]);
	}

	createOrGetFromCache(metaData: ICaseMapState): any {
		const cacheId = this.generateLayerId(metaData);
		const cacheLayers = this.cacheService.getLayerFromCache(cacheId);
		if (cacheLayers.length) {
			return Promise.resolve(cacheLayers);
		}

		return this.create(metaData).then((layers) => {
			this.cacheService.addLayerToCache(cacheId, layers);
			return layers;
		});
	}

	createAsync(metaData: ICaseMapState): Promise<any> {
		return this.createOrGetFromCache(metaData).then((layers) => {
			return this.addFootprintToLayerPromise(Promise.resolve(layers[0]), metaData);
		});
	}


	getThumbnailName(overlay: IOverlay): string {
		return overlay.name;
	}

	private createProjection(overlay) {
		const extent: any = [0, 0, overlay.tag.imageData.ExifImageWidth, overlay.tag.imageData.ExifImageHeight];
		const boundary = overlay.tag.geoData.footprint.geometry.coordinates[0];
		const code = `tb-image ${overlay.id}`;
		const transformer = createTransform(boundary, extent[2], extent[3]);

		const projection = new Projection({
			code,
			units: 'pixels',
			extent
		});

		proj.addProjection(projection);
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

		return projection;

	}

	private createDroneTiffProjection(overlay) {
		if (overlay.sensorType !== 'Awesome Drone Imagery (GeoTIFF)') {
			return 'EPSG:3857';
		}
		const extent: any = [0, 0, overlay.tag.imageData.ExifImageWidth, overlay.tag.imageData.ExifImageHeight];
		const boundary = overlay.tag.geoData.footprint.geometry.coordinates[0];
		const transformer = createTransform(boundary, extent[2], extent[3]);

		const projection = new Projection({
			code: `${overlay.id}`,
			units: 'm',
			axisOrientation: 'neu',
			global: false
		});

		proj.addProjection(projection);

		proj.addCoordinateTransforms(projection, 'EPSG:3857',
			coords => {
				return transformer.EPSG3857(FROMPIXEL, ...coords);

			},
			coords => {
				return transformer.EPSG3857(FROMCOORDINATES, ...coords);
			}
		);

		proj.addCoordinateTransforms(projection, 'EPSG:4326', function ([x, y]) {
				return transformer.EPSG4326(FROMPIXEL, x, y + overlay.tag.imageData.ExifImageHeight);
			},
			([lng, lat]) => {
				const [x, y] = transformer.EPSG4326(FROMCOORDINATES, lng, lat);
				return [x, y - overlay.tag.imageData.ExifImageHeight];
			}
		);

		return projection;
	}


}
