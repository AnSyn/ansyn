/**
 * Created by EldadCohen on 22/05/2017.
 */

import { BaseSourceProvider } from '@ansyn/imagery';
import * as ol from 'openlayers';

export class OpenLayerIDAHOSourceProvider extends BaseSourceProvider {
	public mapType = 'openLayersMap';
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

	createAsync(metaData: any): Promise<any> {
		let layer = this.create(metaData);
		return Promise.resolve(layer);
	}
}
