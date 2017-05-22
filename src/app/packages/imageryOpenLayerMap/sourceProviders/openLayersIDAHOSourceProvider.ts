/**
 * Created by EldadCohen on 22/05/2017.
 */

import { BaseSourceProvider } from '@ansyn/map-source-provider';
import * as ol from 'openlayers';

export class OpenLayerIDAHOSourceProvider extends BaseSourceProvider {
	public mapType = 'openLayerMap';
	public sourceType = 'IDAHO';

	constructor() {
		super();
	}

	create(metaData: any): any {
		const osmLayer = new ol.layer.Tile({
            source: new ol.source.OSM({
                url: metaData.imageUrl
            })
        });
		return osmLayer;
	}
}
