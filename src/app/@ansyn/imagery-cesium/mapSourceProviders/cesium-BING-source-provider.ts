import { BaseMapSourceProvider, IBaseImageryMapConstructor, ImageryMapSource, IMapSettings } from '@ansyn/imagery';
import { CesiumMap } from '../maps/cesium-map/cesium-map';
import { CesiumLayer } from '../models/cesium-layer';

declare const Cesium: any;

export const CesiumBingSourceProviderSourceType = 'CESIUM_BING';

@ImageryMapSource({
	sourceType: CesiumBingSourceProviderSourceType,
	supported: [CesiumMap]
})
export class CesiumBINGSourceProvider extends BaseMapSourceProvider {
	readonly supported: IBaseImageryMapConstructor[];

	protected create(metaData: IMapSettings): Promise<any> {
		const cesiumBingLayer = new Cesium.BingMapsImageryProvider({
			url: 'https://dev.virtualearth.net',
			key: 'Ag9RlBTbfJQMhFG3fxO9fLAbYMO8d5sevTe-qtDsAg6MjTYYFMFfFFrF2SrPIZNq',
			mapStyle: Cesium.BingMapsStyle.AERIAL_WITH_LABELS
		});
		const layer = new CesiumLayer(cesiumBingLayer);
		return Promise.resolve(layer);
	}

}
