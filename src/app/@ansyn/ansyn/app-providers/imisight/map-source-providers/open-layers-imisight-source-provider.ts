import TileLayer from 'ol/layer/tile';
import TileWMS from 'ol/source/tilewms';
import { OpenLayersMapSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers.map-source-provider';
import { OpenLayersDisabledMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { ICaseMapState } from '@ansyn/core/models/case.model';
import { ImageryMapSource } from '@ansyn/imagery/decorators/map-source-provider';
import { ImisightOverlaySourceType } from '@ansyn/ansyn/app-providers/imisight/overlays-source-providers/imisight-source-provider';
import { HttpClient } from '@angular/common/http';
import {
	IMapSourceProvidersConfig,
	MAP_SOURCE_PROVIDERS_CONFIG
} from '@ansyn/ansyn/app-providers/map-source-providers/map-source-providers-config';
import { CacheService } from '@ansyn/imagery/cache-service/cache.service';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { Inject } from '@angular/core';

@ImageryMapSource({
	sourceType: ImisightOverlaySourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayersImisightSourceProvider extends OpenLayersMapSourceProvider {
	companyId = 1;
	gatewayUrl = 'https://gw.sat.imisight.net';

	constructor(protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService,
				@Inject(MAP_SOURCE_PROVIDERS_CONFIG) protected config: IMapSourceProvidersConfig,
				protected httpClient: HttpClient) {
		super(cacheService, imageryCommunicatorService, config);
	}

	protected create(metaData: ICaseMapState): any[] {
		const url = metaData.data.overlay.imageUrl;
		const layers = metaData.data.overlay.tag.urls;
		const projection = 'EPSG:3857';

		const source = new TileWMS({
			url: `${this.gatewayUrl}/geo/geoserver/company_${this.companyId}/wms`,
			params: {
				TRANSPARENT: true,
				VERSION: '1.1.1',
				LAYERS: layers
				// FORMAT: 'image/gif'
			},
			serverType: 'geoserver',
			tileLoadFunction: (tile, src) => {
				this.getImageURL(src)
					.subscribe(
						(imgUrl): any => (<any>tile).getImage().src = imgUrl,
						err => {
							console.log('error ', err);
						});
			}
		});

		return [new TileLayer({ source })];
	}

	createAsync(metaData: ICaseMapState): Promise<any> {
		let layer = this.createOrGetFromCache(metaData);
		return Promise.resolve(layer[0]);
	}

	getImageURL(url: string) {
		const token = localStorage.getItem('access_token');
		const headers = {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + token,
			'Accept': 'image/webp,image/*,*/*'
		};
		return this.httpClient
			.get(url, { headers: headers, responseType: 'blob' })
			.map(blob => URL.createObjectURL(blob));
	}
}
