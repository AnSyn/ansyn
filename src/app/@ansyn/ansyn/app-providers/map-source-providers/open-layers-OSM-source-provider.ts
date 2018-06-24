import OSM from 'ol/source/osm';
import TileLayer from 'ol/layer/tile';
import { Injectable } from '@angular/core';
import { OpenLayersMapSourceProvider } from '@ansyn/ansyn/app-providers/map-source-providers/open-layers.map-source-provider';

export const OpenLayerOSMSourceProviderSourceType = 'OSM';


@Injectable()
export class OpenLayerOSMSourceProvider extends OpenLayersMapSourceProvider {
	public sourceType = OpenLayerOSMSourceProviderSourceType;

	create(metaData: any): any[] {
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

		const openSeaMapLayer = new TileLayer({ source });
		return [osmLayer, openSeaMapLayer];
	}
}
