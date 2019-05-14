import { BaseMapSourceProvider, ImageryMapSource, IBaseImageryMapConstructor, IMapSettings } from '@ansyn/imagery';
import { CesiumMap } from '../maps/cesium-map/cesium-map';
import { CesiumLayer } from '../models/cesium-layer';
import { ICaseMapState } from '../../ansyn/modules/menu-items/cases/models/case.model';

declare const Cesium: any;

export const CesiumOSMSourceProviderSourceType = 'OSM';

@ImageryMapSource({
	supported: [CesiumMap],
	sourceType: CesiumOSMSourceProviderSourceType
})
export class CesiumOsmSourceProvider extends BaseMapSourceProvider {
	readonly supported: IBaseImageryMapConstructor[];

	protected create(metaData: ICaseMapState): Promise<any> {
		const cesiumOsmLayer = Cesium.createOpenStreetMapImageryProvider({ url: 'https://a.tile.openstreetmap.org/' });
		const layer = new CesiumLayer(cesiumOsmLayer);
		return Promise.resolve(layer);
	}

}
