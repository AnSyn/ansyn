import { BaseMapSourceProvider } from '@ansyn/imagery';
import OSM from 'ol/source/osm';
import TileLayer from 'ol/layer/tile';
import { Injectable } from '@angular/core';
import { CacheService } from '@ansyn/imagery/cache-service/cache.service';
import { Store } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map';

export const OpenLayerOSMSourceProviderMapType = OpenlayersMapName;
export const OpenLayerOSMSourceProviderSourceType = 'OSM';


@Injectable()
export class OpenLayerOSMSourceProvider extends BaseMapSourceProvider {
	public mapType = OpenLayerOSMSourceProviderMapType;
	public sourceType = OpenLayerOSMSourceProviderSourceType;

	constructor(protected store: Store<any>, protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
		super(store, cacheService, imageryCommunicatorService)
	}

	create(metaData: any): any[] {
		const osmLayer = new TileLayer({
			source: new OSM()
		});

		const source = new OSM(<any>{
			attributions: [
				'All maps © <a href="http://www.openseamap.org/">OpenSeaMap</a>',
				OSM.ATTRIBUTION
			],
			opaque: false,
			url: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png'
		});

		const openSeaMapLayer = new TileLayer({ source });
		return [osmLayer, openSeaMapLayer];
	}
}
