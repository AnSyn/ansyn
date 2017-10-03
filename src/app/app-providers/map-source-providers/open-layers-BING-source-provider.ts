/**
 * Created by AsafMas on 26/06/2017.
 */
import { BaseMapSourceProvider } from '@ansyn/imagery';
import TileLayer from 'ol/layer/tile';
import BingMaps from 'ol/source/bingmaps';

export const OpenLayerBingSourceProviderMapType = 'openLayersMap';
export const OpenLayerBingSourceProviderSourceType = 'BING';

export class OpenLayerBingSourceProvider extends BaseMapSourceProvider {
	public mapType = OpenLayerBingSourceProviderMapType;
	public sourceType = OpenLayerBingSourceProviderSourceType;

	create(metaData: any): any {
		return metaData.styles.map(style => new TileLayer({
			visible: true,
			preload: Infinity,
			source: new BingMaps({
				key: metaData.key,
				imagerySet: style,
				maxZoom: 19
			})
		}));
	}

	createAsync(metaData: any): Promise<any> {
		let layer = this.create(metaData);
		return Promise.resolve(layer);
	}
}
