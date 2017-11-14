import { BaseMapSourceProvider } from '@ansyn/imagery';
import XYZ from 'ol/source/xyz';
import ImageLayer from 'ol/layer/image';
import { ProjectableRaster } from '@ansyn/open-layers-map';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { SetToastMessageStoreAction } from '@ansyn/status-bar/actions/status-bar.actions';

export const OpenLayerIDAHOSourceProviderMapType = 'openLayersMap';
export const OpenLayerIDAHOSourceProviderSourceType = 'IDAHO';

@Injectable()
export class OpenLayerIDAHOSourceProvider extends BaseMapSourceProvider {

	public mapType = OpenLayerIDAHOSourceProviderMapType;
	public sourceType = OpenLayerIDAHOSourceProviderSourceType;

	create(metaData: any, mapId: string): any {
		const source = new XYZ({
			url: metaData.imageUrl,
			crossOrigin: 'Anonymous',
			projection: 'EPSG:3857'
		});

		this.monitorSource(source, mapId);

		return new ImageLayer({
			source: new ProjectableRaster({
				sources: [source],
				operation: (pixels) => pixels[0],
				operationType: 'image'
			})
		});
	}

	createAsync(metaData: any, mapId: string): Promise<any> {
		let layer = this.create(metaData, mapId);
		return Promise.resolve(layer);
	}
}
