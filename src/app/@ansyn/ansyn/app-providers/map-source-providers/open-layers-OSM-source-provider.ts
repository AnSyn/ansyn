import { BaseMapSourceProvider } from '@ansyn/imagery';
import OSM from 'ol/source/osm';
import TileLayer from 'ol/layer/tile';
import { Injectable } from '@angular/core';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map';

export const OpenLayerOSMSourceProviderMapType = OpenlayersMapName;
export const OpenLayerOSMSourceProviderSourceType = 'OSM';


@Injectable()
export class OpenLayerOSMSourceProvider extends BaseMapSourceProvider {
	public mapType = OpenLayerOSMSourceProviderMapType;
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
