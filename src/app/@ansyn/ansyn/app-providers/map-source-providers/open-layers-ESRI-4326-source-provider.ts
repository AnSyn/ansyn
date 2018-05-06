import XYZ from 'ol/source/xyz';
import TileLayer from 'ol/layer/tile';
import { Injectable } from '@angular/core';
import { CacheService } from '@ansyn/imagery/cache-service/cache.service';
import { Store } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { BaseMapSourceProvider } from '@ansyn/imagery/model/base-map-source-provider';
import { DisabledOpenLayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';

export const OpenLayerESRI_4326SourceProviderSourceType = 'ESRI_4326';

@Injectable()
export class OpenLayerESRI4326SourceProvider extends BaseMapSourceProvider {
	public supported =  [OpenlayersMapName, DisabledOpenLayersMapName];
	public sourceType = OpenLayerESRI_4326SourceProviderSourceType;

	constructor(protected store: Store<any>, protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
		super(store, cacheService, imageryCommunicatorService)
	}
	create(metaData: any): any[] {
		const source = new XYZ({
			attributions: 'Copyright:© 2013 ESRI, i-cubed, GeoEye',
			maxZoom: 16,
			projection: 'EPSG:4326',
			tileSize: 512,
			tileUrlFunction: function(tileCoord) {
				return 'https://services.arcgisonline.com/arcgis/rest/services/ESRI_Imagery_World_2D/MapServer/tile/{z}/{y}/{x}'
					.replace('{z}', (tileCoord[0] - 1).toString())
					.replace('{x}', tileCoord[1].toString())
					.replace('{y}', (-tileCoord[2] - 1).toString());
			},
			wrapX: true
		});

		const esriLayer = new TileLayer({
			source: source,
			visible: true
		});

		return [esriLayer];
	}
}
