import { BaseMapSourceProvider } from '@ansyn/imagery/index';
import XYZ from 'ol/source/xyz';
import ImageLayer from 'ol/layer/image';
import { ProjectableRaster } from '@ansyn/plugins/openlayers/open-layers-map';
import { Injectable } from '@angular/core';
import { Overlay } from '@ansyn/core/index';
import { extentFromGeojson } from '@ansyn/core/utils/index';
import proj from 'ol/proj';
import { Store } from '@ngrx/store';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { CacheService } from '@ansyn/imagery/cache-service/cache.service';

export const OpenLayerPlanetSourceProviderMapType = 'openLayersMap';
export const OpenLayerPlanetSourceProviderSourceType = 'PLANET';

@Injectable()
export class OpenLayerPlanetSourceProvider extends BaseMapSourceProvider {



	public mapType = OpenLayerPlanetSourceProviderMapType;
	public sourceType = OpenLayerPlanetSourceProviderSourceType;

	constructor(protected store: Store<any>, protected cacheService: CacheService,
				protected imageryCommunicatorService: ImageryCommunicatorService) {
		super(store, cacheService, imageryCommunicatorService)
	}

	create(metaData: Overlay, mapId: string): any[] {
		const source = new XYZ({
			url: metaData.imageUrl,
			crossOrigin: 'Anonymous',
			projection: 'EPSG:3857'
		});

		this.monitorSource(source, mapId);
		let [x, y, x1, y1] = extentFromGeojson(metaData.footprint);
		[x, y] = proj.transform([x, y], 'EPSG:4326', 'EPSG:3857');
		[x1, y1] = proj.transform([x1, y1], 'EPSG:4326', 'EPSG:3857');

		return [new ImageLayer({
			source: new ProjectableRaster({
				sources: [source],
				operation: (pixels) => pixels[0],
				operationType: 'image'
			}),
			extent: [x, y, x1, y1]
		})];
	}

	createAsync(metaData: any, mapId: string): Promise<any> {
		let layer = this.createOrGetFromCache(metaData, mapId);
		return Promise.resolve(layer[0]);
	}
}
