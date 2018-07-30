import XYZ from 'ol/source/xyz';
import ImageLayer from 'ol/layer/image';
import proj from 'ol/proj';
import { extentFromGeojson } from '@ansyn/core/utils/calc-extent';
import { ProjectableRaster } from '@ansyn/plugins/openlayers/open-layers-map/models/projectable-raster';
import { OpenLayersMapSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers.map-source-provider';
import { OpenLayersDisabledMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { ICaseMapState } from '@ansyn/core/models/case.model';
import { ImageryMapSource } from '@ansyn/imagery/decorators/map-source-provider';
import { IOverlay } from '@ansyn/core/models/overlay.model';
import { HttpClient } from '@angular/common/http';
import { CacheService } from '@ansyn/imagery/cache-service/cache.service';
import {
	IMapSourceProvidersConfig,
	MAP_SOURCE_PROVIDERS_CONFIG
} from '@ansyn/ansyn/app-providers/map-source-providers/map-source-providers-config';
import { Inject } from '@angular/core';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';

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
		if (metaData.data.overlay.channel === 1) {
			this.addBands(metaData.data.overlay, '0');
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
			if (imageData) {
				this.setColorChannel(metaData.data.overlay, imageData.bandAliases);
			} else {
				this.addBands(metaData.data.overlay, '0');
			}

			if (associationData) {
				this.setPannedUrl(metaData.data.overlay, associationData);
			}
			let layer = this.createOrGetFromCache(metaData);
			return Promise.resolve(layer[0]);
		});
	}

	setColorChannel(overlay: IOverlay, colorChannels: string) {
		const rIndex = colorChannels.indexOf('R');
		const gIndex = colorChannels.indexOf('G');
		const bIndex = colorChannels.indexOf('B');
		const bands = `${rIndex},${gIndex},${bIndex}`;
		this.addBands(overlay, bands);
	}

	addBands(overlay: IOverlay, bands: string) {
		overlay.imageUrl = (<any>overlay).baseImageUrl + '&bands=' + bands;
	}

	setPannedUrl(overlay: IOverlay, associationData: any) {
		if (associationData.associations && associationData.associations.length > 0) {
			overlay.imageUrl = (<any>overlay).baseImageUrl + '&panId=' + associationData.associations[0].imageId;
		}
	}

	getImageData(overlay: IOverlay, token, fileName: string): Promise<any> {
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
