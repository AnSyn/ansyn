import { BaseMapSourceProvider, ImageryMapSource } from '@ansyn/imagery';
import { ICaseMapState } from '@ansyn/core';
import { CesiumMap } from '../maps/cesium-map/cesium-map';

export const CesiumOSMSourceProviderSourceType = 'OSM';

@ImageryMapSource({
	supported: [CesiumMap],
	sourceType: CesiumOSMSourceProviderSourceType
})
export class OsmSourceProvider extends BaseMapSourceProvider {

	protected create(metaData: ICaseMapState): any[] {
		const cesiumOsmLayer = Cesium.createOpenStreetMapImageryProvider({ url: 'https://a.tile.openstreetmap.org/' });
		return [cesiumOsmLayer];
	}

}
