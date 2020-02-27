import { BaseMapSourceProvider, IBaseImageryMapConstructor, ImageryMapSource, IMapSettings } from '@ansyn/imagery';
import { CesiumMap } from '../maps/cesium-map/cesium-map';
import { CesiumLayer } from '../models/cesium-layer';

declare const Cesium: any;

export const CesiumOSMSourceProviderSourceType = 'CESIUM_OSM';

@ImageryMapSource({
	supported: [CesiumMap],
	sourceType: CesiumOSMSourceProviderSourceType
})
export class CesiumOsmSourceProvider extends BaseMapSourceProvider {
	readonly supported: IBaseImageryMapConstructor[];

	protected create(metaData: IMapSettings): Promise<any> {
		const cesiumOsmLayer = new Cesium.OpenStreetMapImageryProvider({
			url : 'https://a.tile.openstreetmap.org/'
		});
		const layer = new CesiumLayer(cesiumOsmLayer);
		return Promise.resolve(layer);
	}
}
