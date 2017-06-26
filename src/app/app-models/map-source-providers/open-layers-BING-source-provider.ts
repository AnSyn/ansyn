/**
 * Created by AsafMas on 26/06/2017.
 */
import { BaseSourceProvider } from '@ansyn/imagery';
import * as ol from 'openlayers';

export class OpenLayerBingSourceProvider extends BaseSourceProvider {
	static s_sourceType = 'BING';
	static s_mapType = 'openLayersMap';

	public mapType;
	public sourceType;

	constructor() {
		super();
		this.sourceType = OpenLayerBingSourceProvider.s_sourceType;
		this.mapType = OpenLayerBingSourceProvider.s_mapType;
	}

	create(metaData: any): any {
		const bingLayers = [];
		let i, ii;
		for (i = 0, ii = metaData.styles.length; i < ii; ++i) {
			bingLayers.push(new ol.layer.Tile({
				visible: true,
				preload: Infinity,
				source: new ol.source.BingMaps({
					key: metaData.key,
					imagerySet: metaData.styles[i]
					// use maxZoom 19 to see stretched tiles instead of the BingMaps
					// "no photos at this zoom level" tiles
					// maxZoom: 19
				})
			}));
		}
		return bingLayers;
	}

	createAsync(metaData: any): Promise<any> {
		let layer = this.create(metaData);
		return Promise.resolve(layer);
	}
}
