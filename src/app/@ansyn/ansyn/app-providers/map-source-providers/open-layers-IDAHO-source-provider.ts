import XYZ from 'ol/source/xyz';
import ImageLayer from 'ol/layer/image';
import { Injectable } from '@angular/core';
import proj from 'ol/proj';
import { CacheService } from '@ansyn/imagery/cache-service/cache.service';
import { Store } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { BaseMapSourceProvider } from '@ansyn/imagery/model/base-map-source-provider';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { extentFromGeojson } from '@ansyn/core/utils/calc-extent';
import { ProjectableRaster } from '@ansyn/plugins/openlayers/open-layers-map/models/projectable-raster';
import { DisabledOpenLayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-disabled-map/openlayers-disabled-map';

export const OpenLayerIDAHOSourceProviderSourceType = 'IDAHO';

@Injectable()
export class OpenLayerIDAHOSourceProvider extends BaseMapSourceProvider {


	public supported =  [OpenlayersMapName, DisabledOpenLayersMapName];
	public sourceType = OpenLayerIDAHOSourceProviderSourceType;

	constructor(protected store: Store<any>, protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
		super(store, cacheService, imageryCommunicatorService)
	}
	create(metaData: Overlay): any[] {
		const source = new XYZ({
			url: metaData.imageUrl,
			crossOrigin: 'Anonymous',
			projection: 'EPSG:3857'
		});

		let [x, y, x1, y1] = extentFromGeojson(metaData.footprint);
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

	createAsync(metaData: any): Promise<any> {
		let layer = this.createOrGetFromCache(metaData);
		return Promise.resolve(layer[0]);
	}

}
