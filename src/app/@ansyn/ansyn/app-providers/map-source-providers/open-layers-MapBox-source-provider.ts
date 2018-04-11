import { BaseMapSourceProvider } from '@ansyn/imagery';
import XYZ from 'ol/source/xyz';
import TileLayer from 'ol/layer/tile';
import { Injectable } from '@angular/core';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map';

export const OpenLayerMapBoxSourceProviderMapType = OpenlayersMapName;
export const OpenLayerMapBoxSourceProviderSourceType = 'MapBox';

@Injectable()
export class OpenLayerMapBoxSourceProvider extends BaseMapSourceProvider {

	public mapType = OpenLayerMapBoxSourceProviderMapType;
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
