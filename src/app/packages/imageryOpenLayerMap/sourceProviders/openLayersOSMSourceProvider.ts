/**
 * Created by AsafMas on 21/05/2017.
 */

import { BaseSourceProvider } from '@ansyn/map-source-provider';
import * as ol from 'openlayers';

export class OpenLayerOSMSourceProvider extends BaseSourceProvider {
	public mapType = 'openLayerMap';
	public sourceType = 'OSM';

	constructor() {
		super();
	}

	create(metaData: any): any {
		const osmLayer = new ol.layer.Tile({source: new ol.source.OSM()});
		return [osmLayer];
	}
}
