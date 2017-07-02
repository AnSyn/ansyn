/**
 * Created by AsafMas on 21/05/2017.
 */

import { BaseSourceProvider } from '@ansyn/imagery';
import * as ol from 'openlayers';

export class OpenLayerOSMSourceProvider extends BaseSourceProvider {
	static s_mapType = 'openLayersMap';
	static s_sourceType = 'OSM';

	public mapType;
	public sourceType;

	constructor() {
		super();

		this.mapType = OpenLayerOSMSourceProvider.s_mapType;
		this.sourceType = OpenLayerOSMSourceProvider.s_sourceType;
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
