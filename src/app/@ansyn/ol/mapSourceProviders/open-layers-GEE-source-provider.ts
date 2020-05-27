import XYZ from 'ol/source/XYZ';
import {
	CacheService,
	ImageryCommunicatorService,
	ImageryMapSource,
	IMapSettings, IMapSourceProvidersConfig,
	MAP_SOURCE_PROVIDERS_CONFIG
} from '@ansyn/imagery';
import { IMAGE_PROCESS_ATTRIBUTE, OpenLayersMapSourceProvider } from './open-layers.map-source-provider';
import { OpenLayersMap } from '../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from '../maps/openlayers-disabled-map/openlayers-disabled-map';
import { HttpClient } from '@angular/common/http';
import { Inject } from '@angular/core';

​
export const OpenLayerGEESourceProviderSourceType = 'GEE';
​
@ImageryMapSource({
	sourceType: OpenLayerGEESourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayerGEESourceProvider extends OpenLayersMapSourceProvider {

	layerData: any;

	constructor(protected httpClient: HttpClient,
				protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig) {
		super(cacheService, imageryCommunicatorService, mapSourceProvidersConfig);
	}

	async create(metaData: IMapSettings): Promise<any> {
		const config = { ...this.config, ...metaData.data.config };

		if (!this.layerData) {
			this.layerData = await this.getLayersData(config.serverUrl);
		}

		const extent = this.createExtent(metaData);
		const source = this.createSource(metaData);
		const tileLayer = this.createLayer(source, extent);
		tileLayer.set(IMAGE_PROCESS_ATTRIBUTE, this.getImageLayer(source, extent));
		return Promise.resolve(tileLayer);
	}

	createSource(metaData: IMapSettings): any {
		const geeDefs = JSON.parse(this.layerData.replace(/([\[\{,])\s*(\w+)\s*:/g, '$1 "$2":'));
		const source = new XYZ({
			url: this.config.serverUrl + `/query?request=` + geeDefs.layers[0].requestType + `&channel=` + geeDefs.layers[0].id + `&version=` + geeDefs.layers[0].version + `&x={x}&y={y}&z={z}`,
			crossOrigin: 'anonymous',
			minZoom: 1
		});
		return source;
	}

	getLayersData(serverURL: string): Promise<any> {
		const fileUrl = serverURL + `/query?request=Json&is2d=t`;
		return this.httpClient.get(fileUrl, { responseType: 'text' }).toPromise();
	}
}
