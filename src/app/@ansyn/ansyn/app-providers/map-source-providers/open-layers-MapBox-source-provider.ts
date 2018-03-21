import { BaseMapSourceProvider } from '@ansyn/imagery';
import XYZ from 'ol/source/xyz';
import TileLayer from 'ol/layer/tile';
import { Injectable } from '@angular/core';
import { CacheService } from '@ansyn/imagery/cache-service/cache.service';
import { Store } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { openLayersMapName } from '@ansyn/plugins/openlayers/open-layers-map';

export const OpenLayerMapBoxSourceProviderMapType = openLayersMapName;
export const OpenLayerMapBoxSourceProviderSourceType = 'MapBox';

@Injectable()
export class OpenLayerMapBoxSourceProvider extends BaseMapSourceProvider {

	public mapType = OpenLayerMapBoxSourceProviderMapType;
	public sourceType = OpenLayerMapBoxSourceProviderSourceType;

	constructor(protected store: Store<any>, protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
		super(store, cacheService, imageryCommunicatorService)
	}
	create(metaData: any, mapId: string): any[] {
		const source = new XYZ({
			url: metaData.imageUrl,
			crossOrigin: 'Anonymous',
			projection: 'EPSG:3857'
		});

		this.monitorSource(source, mapId);

		const mapBoxLayer = new TileLayer(<any>{
			source: source,
			visible: true,
			preload: Infinity
		});

		return [mapBoxLayer];
	}
}
