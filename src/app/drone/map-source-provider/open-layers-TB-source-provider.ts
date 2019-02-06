import { OpenLayersDisabledMap, OpenLayersMap, OpenLayersMapSourceProvider } from '@ansyn/plugins';
import { CacheService, ImageryCommunicatorService, ImageryMapSource } from '@ansyn/imagery';
import { ICaseMapState, IMapSourceProvidersConfig, IOverlay, MAP_SOURCE_PROVIDERS_CONFIG } from '@ansyn/core';
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
		@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig
	) {
		super(cacheService, imageryCommunicatorService, mapSourceProvidersConfig);
	}

	public create(metaData: ICaseMapState): any {
		let layer;
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

			layer = new ImageLayer({
				source,
				extent
			});
		}
		else
			{
				const projection = this.createDroneTiffProjection(metaData.data.overlay);
				const source = new TileWMS(<any>{
					url: metaData.data.overlay.imageUrl,
					params: {
						'VERSION': '1.1.0',
						LAYERS: metaData.data.overlay.tag.geoserver.layer.resource.name
					},
					projection
				});
				if (metaData.data.overlay.sensorType !== 'Awesome Drone Imagery (GeoTIFF)') {
					layer = new TileLayer({ visible: true, source });
				} else {
					const extent: any = [0, -metaData.data.overlay.tag.imageData.ExifImageHeight, metaData.data.overlay.tag.imageData.ExifImageWidth, 0];
					layer = new TileLayer({ visible: true, source, extent });
					const originalTileUrlFunction = (<any>source).tileUrlFunction;
					(<any>source).tileUrlFunction = function (...args) {
						const wmsURL = originalTileUrlFunction(...args);
						const start = wmsURL.indexOf('SRS=') + 4;
						const end = wmsURL.indexOf('&', start);
						return `${wmsURL.substring(0, start)}EPSG:32662${wmsURL.substring(end)}`;
					}
				}
			}
		return [layer];
		}


	createAsync(metaData: ICaseMapState): Promise<any> {
		let layers = this.createOrGetFromCache(metaData);
		return this.addFootprintToLayerPromise(Promise.resolve(layers[0]), metaData);
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
			return overlay.tag.geoserver.data.srs
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
