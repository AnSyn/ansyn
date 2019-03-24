import { BaseMapSourceProvider, ImageryMapSource } from '@ansyn/imagery';
import { CesiumMap } from '../maps/cesium-map/cesium-map';
import { ICaseMapState } from '@ansyn/core';
import { CesiumLayer } from "../models/cesium-layer";
declare const Cesium: any;

export const CesiumBingSourceProviderSourceType = 'BING_CESIUM';

@ImageryMapSource({
	sourceType: CesiumBingSourceProviderSourceType,
	supported: [CesiumMap]
})
export class CesiumBINGSourceProvider extends BaseMapSourceProvider {
	protected create(metaData: ICaseMapState): any[] {
		const cesiumBingLayer = new Cesium.BingMapsImageryProvider({
			url: 'https://dev.virtualearth.net',
			key: 'Ag9RlBTbfJQMhFG3fxO9fLAbYMO8d5sevTe-qtDsAg6MjTYYFMFfFFrF2SrPIZNq',
			mapStyle: Cesium.BingMapsStyle.AERIAL_WITH_LABELS
		});
		const layer = new CesiumLayer(cesiumBingLayer);
		return [layer];
	}

}
