import XYZ from 'ol/source/xyz';
import ImageLayer from 'ol/layer/image';
import proj from 'ol/proj';
import { extentFromGeojson, ICaseMapState, Overlay } from '@ansyn/core';
import { OpenLayersDisabledMap, OpenLayersMap, ProjectableRaster } from '@ansyn/plugins';
import { CacheService, ImageryCommunicatorService, ImageryMapSource } from '@ansyn/imagery';
import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';
import { IMapSourceProvidersConfig, MAP_SOURCE_PROVIDERS_CONFIG } from './map-source-providers-config';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';

export const OpenLayerIDAHOSourceProviderSourceType = 'IDAHO';

@ImageryMapSource({
	sourceType: OpenLayerIDAHOSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayerIDAHOSourceProvider extends OpenLayersMapSourceProvider {

	constructor(protected httpClient: HttpClient,
				protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected config: IMapSourceProvidersConfig) {
		super(cacheService, imageryCommunicatorService, config);
	}

	create(metaData: ICaseMapState): any[] {
		const source = new XYZ({
			url: metaData.data.overlay.imageUrl,
			crossOrigin: 'Anonymous',
			projection: 'EPSG:3857'
		});

		let [x, y, x1, y1] = extentFromGeojson(metaData.data.overlay.footprint);
		[x, y] = proj.transform([x, y], 'EPSG:4326', 'EPSG:3857');
		[x1, y1] = proj.transform([x1, y1], 'EPSG:4326', 'EPSG:3857');

		const result = new ImageLayer({
			source: new ProjectableRaster({
				sources: [source],
				operation: (pixels) => pixels[0],
				operationType: 'image'
			}),
			extent: [x, y, x1, y1]
		});
		return [result];
	}

	createAsync(metaData: ICaseMapState): Promise<any> {
		if (metaData.data.overlay.imageUrl) {
			let layer = this.createOrGetFromCache(metaData);
			return Promise.resolve(layer[0]);
		}

		if (metaData.data.overlay.channel === 1) {
			const bands = this.getBandsSection(metaData.data.overlay, '0');
			metaData.data.overlay.imageUrl = metaData.data.overlay.baseImageUrl + bands;
			let layer = this.createOrGetFromCache(metaData);
			return Promise.resolve(layer[0]);
		}

		const token = (<any>metaData.data.overlay).token;
		let imageData, associationData;
		const getImagePromise = this.getImageData(metaData.data.overlay, token, 'image')
			.then((data) => {
				imageData = data;
			})
			.catch((excpetion) => {
			});

		const getAssociationPromise = this.getImageData(metaData.data.overlay, token, 'associations')
			.then((data) => {
				associationData = data;
			})
			.catch((excpetion) => {
			});

		return Promise.all([getImagePromise, getAssociationPromise]).then(() => {
			let imageUrl = metaData.data.overlay.baseImageUrl;
			let bands = this.getColorChannel(metaData.data.overlay, imageData);
			imageUrl += bands;

			if (associationData) {
				const panned = this.getPannedSection(metaData.data.overlay, associationData);
				imageUrl += panned;
			}
			metaData.data.overlay.imageUrl = imageUrl;
			let layer = this.createOrGetFromCache(metaData);
			return Promise.resolve(layer[0]);
		});
	}

	getColorChannel(overlay: Overlay, imageData: any): string {
		let rgbBans: string;
		if (imageData && imageData.bandAliases) {
			const rIndex = imageData.bandAliases.indexOf('R');
			const gIndex = imageData.bandAliases.indexOf('G');
			const bIndex = imageData.bandAliases.indexOf('B');
			rgbBans = `${rIndex},${gIndex},${bIndex}`;
		} else {
			rgbBans = '0';
			if (overlay.channel > 1 && overlay.channel < 5) {
				rgbBans = '2,1,0';
			} else if (overlay.channel >= 5) {
				rgbBans = '4,2,1';
			}
		}
		return this.getBandsSection(overlay, rgbBans);
	}

	getBandsSection(overlay: Overlay, bands: string): string {
		return '&bands=' + bands;
	}

	getPannedSection(overlay: Overlay, associationData: any): string {
		if (associationData.associations && associationData.associations.length > 0) {
			// overlay.imageUrl = overlay.baseImageUrl + '&panId=' + associationData.associations[0].imageId;
			return '&panId=' + associationData.associations[0].imageId;
		}
		return '';
	}

	getImageData(overlay: Overlay, token, fileName: string): Promise<any> {
		const idahoElement = overlay.tag;
		const fileUrl = `http://idaho.geobigdata.io/v1/metadata/${idahoElement.properties.bucketName}/${overlay.id}/${fileName}.json`;

		const httpOptions = {
			headers: {
				'Authorization': 'Bearer ' + token
			}
		};

		return this.httpClient.get(fileUrl, httpOptions).toPromise();
	}
}
