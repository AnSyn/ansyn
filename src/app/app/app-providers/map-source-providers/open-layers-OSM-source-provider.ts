import { BaseMapSourceProvider } from '@ansyn/imagery';
import OSM from 'ol/source/osm';
import TileLayer from 'ol/layer/tile';
import { Injectable } from '@angular/core';

export const OpenLayerOSMSourceProviderMapType = 'openLayersMap';
export const OpenLayerOSMSourceProviderSourceType = 'OSM';


@Injectable()
export class OpenLayerOSMSourceProvider extends BaseMapSourceProvider {
	public mapType = OpenLayerOSMSourceProviderMapType;
	public sourceType = OpenLayerOSMSourceProviderSourceType;

	create(metaData: any, mapId: string): any {
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

		this.monitorSource(source, mapId);

		const openSeaMapLayer = new TileLayer({ source });
		return [osmLayer, openSeaMapLayer];
	}

	createAsync(metaData: any, mapId: string): Promise<any> {
		let layer = this.create(metaData, mapId);
		return Promise.resolve(layer);
	}
}
