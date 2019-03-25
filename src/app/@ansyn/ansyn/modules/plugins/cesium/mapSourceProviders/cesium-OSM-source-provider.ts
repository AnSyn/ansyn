import { BaseMapSourceProvider, ImageryMapSource } from '@ansyn/imagery';
import { ICaseMapState } from '@ansyn/core';
import { CesiumMap } from '../maps/cesium-map/cesium-map';
import { CesiumLayer } from '../models/cesium-layer';
declare const Cesium: any;

export const CesiumOSMSourceProviderSourceType = 'OSM';

@ImageryMapSource({
	supported: [CesiumMap],
	sourceType: CesiumOSMSourceProviderSourceType
})
export class CesiumOsmSourceProvider extends BaseMapSourceProvider {

	protected create(metaData: ICaseMapState): any[] {
		const cesiumOsmLayer = Cesium.createOpenStreetMapImageryProvider({ url: 'https://a.tile.openstreetmap.org/' });
		const layer = new CesiumLayer(cesiumOsmLayer);
		return [layer];
	}

}
