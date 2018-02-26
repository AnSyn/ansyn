import { BaseMapSourceProvider } from '@ansyn/imagery';
import XYZ from 'ol/source/xyz';
import ImageLayer from 'ol/layer/image';
import { ProjectableRaster } from '@ansyn/open-layers-map';
import { Injectable } from '@angular/core';
import { Overlay } from '@ansyn/core';
import { extentFromGeojson } from '@ansyn/core/utils';
import proj from 'ol/proj';

export const OpenLayerIDAHOSourceProviderMapType = 'openLayersMap';
export const OpenLayerIDAHOSourceProviderSourceType = 'IDAHO';

@Injectable()
export class OpenLayerIDAHOSourceProvider extends BaseMapSourceProvider {

	public mapType = OpenLayerIDAHOSourceProviderMapType;
	public sourceType = OpenLayerIDAHOSourceProviderSourceType;

	create(metaData: Overlay, mapId: string): any {
		const id = `${metaData.id}_${this.sourceType}`;
		const layer = this.cacheService.getLayerFromCache(id);
		if (layer) {
			return layer;
		}

		const source = new XYZ({
			url: metaData.imageUrl,
			crossOrigin: 'Anonymous',
			projection: 'EPSG:3857'
		});

		this.monitorSource(source, mapId);
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
		this.cacheService.addLayerToCache(id, result);
		return result;
	}

	createAsync(metaData: any, mapId: string): Promise<any> {
		let layer = this.create(metaData, mapId);
		return Promise.resolve(layer);
	}
}
