import { BaseMapSourceProvider } from '@ansyn/imagery';
import XYZ from 'ol/source/xyz';
import TileLayer from 'ol/layer/tile';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

export const OpenLayerMapBoxSourceProviderMapType = 'openLayersMap';
export const OpenLayerMapBoxSourceProviderSourceType = 'MapBox';

@Injectable()
export class OpenLayerMapBoxSourceProvider extends BaseMapSourceProvider {

	public mapType = OpenLayerMapBoxSourceProviderMapType;
	public sourceType = OpenLayerMapBoxSourceProviderSourceType;

	constructor(store: Store<any>) {
		super(store);
	}

	create(metaData: any, mapId: string): any {
		const source = new XYZ({
			url: metaData.imageUrl,
			crossOrigin: 'Anonymous',
			projection: 'EPSG:3857'
		});

		this.monitorSource(source, mapId);

		const mapBoxLayer = new TileLayer({
			source: source,
			visible: true,
			preload: Infinity
		});

		return [mapBoxLayer];
	}

	createAsync(metaData: any, mapId: string): Promise<any> {
		let layer = this.create(metaData, mapId);
		return Promise.resolve(layer);
	}
}
