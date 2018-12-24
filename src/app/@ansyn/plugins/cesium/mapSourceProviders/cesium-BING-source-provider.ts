import { BaseMapSourceProvider, ImageryMapSource } from '@ansyn/imagery';
import { CesiumMap } from '../maps/cesium-map/cesium-map';
import { ICaseMapState } from '@ansyn/core';

export const CesiumBingSourceProviderSourceType = 'BING_CESIUM';

@ImageryMapSource({
	sourceType: CesiumBingSourceProviderSourceType,
	supported: [CesiumMap]
})
export class CesiumBINGSourceProvider extends BaseMapSourceProvider {
	protected create(metaData: ICaseMapState): any[] {
		console.log('bing')
		const cesiumBingLayer = new Cesium.BingMapsImageryProvider({
			url: 'https://dev.virtualearth.net',
			key: 'Ag9RlBTbfJQMhFG3fxO9fLAbYMO8d5sevTe-qtDsAg6MjTYYFMFfFFrF2SrPIZNq',
			mapStyle: Cesium.BingMapsStyle.AERIAL_WITH_LABELS
		});
		return [cesiumBingLayer];
	}

}
