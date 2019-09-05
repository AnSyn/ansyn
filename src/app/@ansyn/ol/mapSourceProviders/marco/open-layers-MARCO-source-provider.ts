import { Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import Layer from 'ol/layer/Layer';
import TileLayer from 'ol/layer/Tile';
import ImageLayer from 'ol/layer/Image';
import {
	CacheService,
	ImageryCommunicatorService,
	ImageryMapSource,
	IMapSettings,
	IMapSourceProvidersConfig,
	MAP_SOURCE_PROVIDERS_CONFIG
} from '@ansyn/imagery';
import { OpenLayersMapSourceProvider } from '../open-layers.map-source-provider';
import { OpenLayersMap } from '../../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from '../../maps/openlayers-disabled-map/openlayers-disabled-map';
import { removeWorkers } from '../../maps/open-layers-map/shared/openlayers-shared';
import { MpTileSource } from './ol-utils/mp-tile-source';
import { MpTileImageSource } from './ol-utils/mp-tile-image-source';

export const OpenLayerMarcoSourceProviderSourceType = 'MARCO_WMTS';

export interface IMarcoConfig {
	imageUrl: string;
	thumbnailImageUrl: string;
	capabilitiesUrl: string;
	tilesServerUrl: string;
}

@ImageryMapSource({
	sourceType: OpenLayerMarcoSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayerMarcoSourceProvider extends OpenLayersMapSourceProvider<IMarcoConfig> {

	private server: string;

	constructor(protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig,
				protected http: HttpClient) {
		super(cacheService, imageryCommunicatorService, mapSourceProvidersConfig);
		this.server = this.config.tilesServerUrl;
	}

	public create(caseMapState: IMapSettings | any): any {
		const overlayMetaData = caseMapState.data.overlay;
		const projectionKey = `projectionKey_${ overlayMetaData.id }`;

		return this.createTileLayer(overlayMetaData.imageUrl, overlayMetaData.approximateTransform, overlayMetaData.min, overlayMetaData.max, projectionKey);
	}

	encodeImagePath(imagePath) {
		let encodeImagePath = imagePath;
		if (encodeImagePath.startsWith('file')) {
			encodeImagePath = encodeImagePath.substr(7);
		}
		return encodeURIComponent(encodeImagePath);
	}

	public createTileLayer(url: string, transform: number[], min: [number], max: [number], projectionKey): Promise<Layer> {

		const approximateTramsforom = transform;
		const imagePath = this.encodeImagePath(url);

		return this.getWMTSCapabilities(imagePath).then((capabilities) => {
			let capabilitiesMeta = {
				LevelsCount: capabilities.Capabilities.contents.tileMatrixSet[0].tileMatrix.length,
				GeoTransform: approximateTramsforom,
				Height: capabilities.Capabilities.contents.datasetDescriptionSummary[0].Layer.boundingBox[0]['ows:BoundingBox'].lowerCorner[1],
				Width: capabilities.Capabilities.contents.datasetDescriptionSummary[0].Layer.boundingBox[0]['ows:BoundingBox'].lowerCorner[0]
			};

			const imageUrl = this.config.imageUrl.replace('{imagePath}', `${ imagePath }`);
			let source = MpTileSource.create(capabilitiesMeta,
				`${ this.server }${ imageUrl }`,
				approximateTramsforom,
				projectionKey);

			source.crossOrigin = 'Anonymous';
			const tileSizeAtLevel0 = (512 * 1 << (capabilitiesMeta.LevelsCount)); // number of pixels in row in non pyramidal image
			const layerViewExtent: [number, number, number, number] = [0,
				0,
				tileSizeAtLevel0,
				tileSizeAtLevel0];

			let tileLayer = new TileLayer({
				visible: true,
				preload: Infinity,
				source: source,
				extent: layerViewExtent
			});

			const imageLayer = this.getMImageLayer(capabilitiesMeta, imagePath, approximateTramsforom, layerViewExtent, projectionKey);
			tileLayer.set('imageLayer', imageLayer);
			removeWorkers(imageLayer);

			console.log('marco service, layer ready:', tileLayer);
			return Promise.resolve(tileLayer);
		});
	}

	private getMImageLayer(capabilitiesMeta, imagePath, approximateTramsforom, extent, projectionKey) {
		// create Image Layer
		const imageUrl = this.config.imageUrl.replace('{imagePath}', `${ imagePath }`);
		let source = MpTileImageSource.create(
			capabilitiesMeta,
			imageUrl,
			approximateTramsforom,
			projectionKey);

		source.crossOrigin = 'Anonymous';

		let imageLayer = new ImageLayer({
			source: source,
			visible: true,
			extent
		});

		return imageLayer;
	}

	private getWMTSCapabilities(url: string): Promise<any> {
		return this.http.get(
			`${ this.server }${ url }${ this.config.capabilitiesUrl }`)
			.toPromise();
	}

	// wmsThumbnailUrl(url: string, bbox: number[]) {
	// 	let imageUrl = this.config.thumbnailImageUrl.replace('{url}', `${url}`);
	// 	imageUrl = imageUrl.replace('{bbox}', `${bbox}`);
	// 	return `${this.server}${imageUrl}`;
	// }

	// getThumbnailUrl(overlay: IOverlay) {
	// 	let { imageUrl, thumbnailUrl } = overlay;
	//
	// 	if (thumbnailUrl) {
	// 		return of(thumbnailUrl);
	// 	}
	//
	// 	imageUrl = this.encodeImagePath(imageUrl);
	//
	// 	return this.getWMSCapabilities(imageUrl).pipe(
	// 		map((res: any) => {
	// 			const { minx, miny, maxx, maxy } = res.WMS_Capabilities.capability.layer.boundingBox[0];
	// 			const thumbnailUrl = this.wmsThumbnailUrl(imageUrl, [minx, miny, maxx, maxy]);
	// 			overlay.thumbnailUrl = thumbnailUrl;
	// 			return thumbnailUrl;
	// 		})
	// 	);
	// }

	// getWMSCapabilities(url: string) {
	// 	return this.http.get(`${this.server}wms/${url}`, {
	// 		params: {
	// 			request: 'GetCapabilities',
	// 			version: '1.0.0',
	// 			format: 'json',
	// 			service: 'WMS'
	// 		}
	// 	}).pipe(
	// 		this.errorHandlerService.handleTimeoutError('Marco WMTSCapabilities.json')
	// 	);
	// }
}
