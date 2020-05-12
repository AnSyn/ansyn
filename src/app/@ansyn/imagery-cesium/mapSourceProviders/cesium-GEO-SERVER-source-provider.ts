import { BaseMapSourceProvider, IBaseImageryMapConstructor, ImageryMapSource, IMapSettings } from '@ansyn/imagery';
import { CesiumMap } from '../maps/cesium-map/cesium-map';
import { CesiumLayer } from '../models/cesium-layer';

declare const Cesium: any;

export const CesiumGeoServerSourceProviderSourceType = 'CESIUM_GEO_SERVER';

@ImageryMapSource({
	supported: [CesiumMap],
	sourceType: CesiumGeoServerSourceProviderSourceType
})
export class CesiumGeoServerSourceProvider extends BaseMapSourceProvider {
	readonly supported: IBaseImageryMapConstructor[];

	protected create(metaData: IMapSettings): Promise<any> {
		const config = {...this.config, ...metaData.data.config};
		const layers = config.layers.join(',');
		const cesiumGeoServerLayer = new Cesium.WebMapServiceImageryProvider({
			url: config.url,
			layers: layers
		});
		const layer = new CesiumLayer(cesiumGeoServerLayer);
		return Promise.resolve(layer);
	}
}
