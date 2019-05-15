import { BaseMapSourceProvider, IBaseImageryMapConstructor, ImageryMapSource, IMapSettings } from '@ansyn/imagery';
import { CesiumMap } from '../maps/cesium-map/cesium-map';
import { CesiumLayer } from '../models/cesium-layer';

declare const Cesium: any;

@ImageryMapSource({
	sourceType: 'PLANET',
	supported: [CesiumMap]
})
export class CesiumPlanetSourceProvider extends BaseMapSourceProvider {
	readonly supported: IBaseImageryMapConstructor[];

	protected create(metaData: IMapSettings): Promise<any> {
		const planetLayer = new Cesium.UrlTemplateImageryProvider({
			url: metaData.data.overlay.imageUrl,
			credit: new Cesium.Credit('© Imagery provided by Planet.com', 'https://www.planet.com/assets/logos/logo-dark.png', 'https://www.planet.com')
		});
		const layer = new CesiumLayer(planetLayer);
		return Promise.resolve(layer);
	}
}
