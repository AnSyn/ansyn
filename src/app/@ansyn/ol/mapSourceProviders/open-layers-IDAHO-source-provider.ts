import {
	CacheService,
	ImageryCommunicatorService,
	ImageryMapSource,
	IMapSettings,
	IMapSourceProvidersConfig,
	MAP_SOURCE_PROVIDERS_CONFIG,
} from '@ansyn/imagery';
import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';
import { OpenLayersMap } from '../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from '../maps/openlayers-disabled-map/openlayers-disabled-map';

export const OpenLayerIDAHOSourceProviderSourceType = 'IDAHO';

@ImageryMapSource({
	sourceType: OpenLayerIDAHOSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayerIDAHOSourceProvider extends OpenLayersMapSourceProvider {

	constructor(protected httpClient: HttpClient,
				protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig) {
		super(cacheService, imageryCommunicatorService, mapSourceProvidersConfig);
	}

	create(metaData: IMapSettings): Promise<any> {
		let layerPromise;

		if (metaData.data.overlay.channel === 1) {
			const bands = this.getBandsSection(metaData.data.overlay, '0');
			metaData.data.overlay.imageUrl = metaData.data.overlay.baseImageUrl + bands;
		}

		if (metaData.data.overlay.imageUrl) {
			let layer = this.createOrGetFromCache(metaData);
			layerPromise = Promise.resolve(layer[0]);
		} else {
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

			layerPromise = Promise.all([getImagePromise, getAssociationPromise]).then(() => {
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

		return layerPromise;
	}

	getColorChannel(overlay: any, imageData: any): string {
		let rgbBans: string;
		if (imageData && imageData.bandAliases) {
			const rIndex = imageData.bandAliases.indexOf('R');
			const gIndex = imageData.bandAliases.indexOf('G');
			const bIndex = imageData.bandAliases.indexOf('B');
			rgbBans = `${ rIndex },${ gIndex },${ bIndex }`;
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

	getBandsSection(overlay: any, bands: string): string {
		return '&bands=' + bands;
	}

	getPannedSection(overlay: any, associationData: any): string {
		if (associationData.associations && associationData.associations.length > 0) {
			// overlay.imageUrl = overlay.baseImageUrl + '&panId=' + associationData.associations[0].imageId;
			return '&panId=' + associationData.associations[0].imageId;
		}
		return '';
	}

	getImageData(overlay: any, token, fileName: string): Promise<any> {
		const idahoElement = overlay.tag;
		const fileUrl = `http://idaho.geobigdata.io/v1/metadata/${ idahoElement.properties.bucketName }/${ overlay.id }/${ fileName }.json`;

		const httpOptions = {
			headers: {
				'Authorization': 'Bearer ' + token
			}
		};

		return this.httpClient.get(fileUrl, httpOptions).toPromise();
	}
}
