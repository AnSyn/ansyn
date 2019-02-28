import { CacheService, ImageryCommunicatorService, ImageryMapSource } from '@ansyn/imagery';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';
import XYZ from 'ol/source/XYZ';
import { Inject } from '@angular/core';
import { ICaseMapState, IMapSourceProvidersConfig, MAP_SOURCE_PROVIDERS_CONFIG } from '@ansyn/core';
import { OpenLayersMap } from '../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from '../maps/openlayers-disabled-map/openlayers-disabled-map';
import { HttpClient } from '@angular/common/http';
import { IAirbusOverlaySourceConfig } from "../../../ansyn/app-providers/overlay-source-providers/airbus-source-provider";

export const OpenLayerAirbusSourceProviderSourceType = 'AIRBUS';

@ImageryMapSource({
	sourceType: OpenLayerAirbusSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap],
	forOverlay: true
})
export class OpenLayersAirbusSourceProvider extends OpenLayersMapSourceProvider {
	get config(): IAirbusOverlaySourceConfig {
		return this.mapSourceProvidersConfig[this.sourceType];
	}
	id: string;

	constructor(
		protected cacheService: CacheService,
		protected imageryCommunicatorService: ImageryCommunicatorService,
		@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected mapSourceProvidersConfig: IMapSourceProvidersConfig,
		protected http: HttpClient
	) {
		super(cacheService, imageryCommunicatorService, mapSourceProvidersConfig);
	}

	createAsync(metaData: ICaseMapState): Promise<any> {
		this.id = metaData.data.overlay.id;
		let layer = this.createOrGetFromCache(metaData);
		let layerPromise = Promise.resolve(layer[0]);
		layerPromise = this.addFootprintToLayerPromise(layerPromise, metaData);
		return layerPromise;
	}


	getXYZSource(url: string) {
		return new XYZ({
			url: `${this.config.baseUrl}/xyz?original=${url}`,
			projection: 'EPSG:3857',
		});
	}


}
