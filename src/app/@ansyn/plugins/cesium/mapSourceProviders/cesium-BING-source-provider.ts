import { BaseMapSourceProvider, ImageryMapSource } from '@ansyn/imagery';
import { CesiumMap } from '../maps/cesium-map/cesium-map';
import { ICaseMapState } from '@ansyn/core';

export const CesiumBingSourceProviderSourceType = 'BING';

@ImageryMapSource({
	sourceType: CesiumBingSourceProviderSourceType,
	supported: [CesiumMap]
})
export class CesiumBINGSourceProvider extends BaseMapSourceProvider {
	protected create(metaData: ICaseMapState): any[] {
		return [];
	}

}
