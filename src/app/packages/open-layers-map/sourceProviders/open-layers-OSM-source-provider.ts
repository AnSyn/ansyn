/**
 * Created by AsafMas on 21/05/2017.
 */

import { BaseSourceProvider } from '@ansyn/map-source-provider';
import * as ol from 'openlayers';

export class OpenLayerOSMSourceProvider extends BaseSourceProvider {
	public mapType = 'openLayersMap';
	public sourceType = 'OSM';

	constructor() {
		super();
	}

	create(metaData: any): any {
		const osmLayer = new ol.layer.Tile({
			source: new ol.source.OSM()
		});
		const openSeaMapLayer = new ol.layer.Tile({
			source: new ol.source.OSM(<any>{
				attributions: [
					'All maps © <a href="http://www.openseamap.org/">OpenSeaMap</a>',
					ol.source.OSM.ATTRIBUTION
				],
				opaque: false,
				url: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png'
			})
		});
		return [osmLayer,openSeaMapLayer];
	}

	createAsync(metaData: any): Promise<any> {
		let layer = this.create(metaData);
		return Promise.resolve(layer);
	}
}
