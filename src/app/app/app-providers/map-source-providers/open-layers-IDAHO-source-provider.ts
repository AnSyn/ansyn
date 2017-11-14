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

	constructor(protected store: Store<any>) {
		super();
	}

	create(metaData: any): any {
		/*
		const source = layer.getSource();

		 */
		const source = new XYZ({
			url: metaData.imageUrl,
			crossOrigin: 'Anonymous',
			projection: 'EPSG:3857'
		});

		source.once('tileloadstart', () => {
			/*
			this will work every request for tile source and will have slightly effect on performance (one function call) nothing wo worry about
			 */
			super.startTimingLog('tileLoad-' + metaData.id);
		});

		source.once('tileloadend', () => {
			super.endTimingLog('tileLoad-' + metaData.id);
		});

		source.once('tileloaderror', (error) => {
			this.store.dispatch(new SetToastMessageStoreAction({
				toastText: 'Failed to load tile',
				showWarningIcon: true
			}));
		});

		return new ImageLayer({
			source: new ProjectableRaster({
				sources: [source],
				operation: (pixels) => pixels[0],
				operationType: 'image'
			})
		});
	}

	createAsync(metaData: any): Promise<any> {
		let layer = this.create(metaData);
		return Promise.resolve(layer);
	}
}
