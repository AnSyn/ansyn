/**
 * Created by AsafMas on 21/05/2017.
 */

import { BaseMapSourceProvider } from '@ansyn/imagery';
import OSM from 'ol/source/osm';
import TileLayer from 'ol/layer/tile';

export const OpenLayerOSMSourceProviderMapType = 'openLayersMap';
export const OpenLayerOSMSourceProviderSourceType = 'OSM';

export class OpenLayerOSMSourceProvider extends BaseMapSourceProvider {
	public mapType;
	public sourceType;

	constructor() {
		super();

		this.mapType = OpenLayerOSMSourceProviderMapType;
		this.sourceType = OpenLayerOSMSourceProviderSourceType;
	}

	create(metaData: any): any {
		const osmLayer = new TileLayer({
			source: new OSM()
		});
		const openSeaMapLayer = new TileLayer({
			source: new OSM(<any>{
				attributions: [
					'All maps © <a href="http://www.openseamap.org/">OpenSeaMap</a>',
					OSM.ATTRIBUTION
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
