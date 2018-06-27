import XYZ from 'ol/source/xyz';
import TileLayer from 'ol/layer/tile';
import { Injectable } from '@angular/core';
import { OpenLayersMapSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers.map-source-provider';

export const OpenLayerMapBoxSourceProviderSourceType = 'MapBox';

@Injectable()
export class OpenLayerMapBoxSourceProvider extends OpenLayersMapSourceProvider {
	public sourceType = OpenLayerMapBoxSourceProviderSourceType;

	create(metaData: any): any[] {
		const source = new XYZ({
			url: metaData.imageUrl,
			crossOrigin: 'Anonymous',
			projection: 'EPSG:3857'
		});

		const mapBoxLayer = new TileLayer(<any>{
			source: source,
			visible: true,
			preload: Infinity
		});

		return [mapBoxLayer];
	}
}
