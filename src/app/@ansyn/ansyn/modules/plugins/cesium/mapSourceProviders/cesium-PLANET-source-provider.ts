import { BaseMapSourceProvider, ImageryMapSource, ICaseMapState } from '@ansyn/imagery';
import { CesiumMap } from '../maps/cesium-map/cesium-map';
import { CesiumLayer } from '../models/cesium-layer';
declare const Cesium: any;

@ImageryMapSource({
	sourceType: 'PLANET',
	supported: [CesiumMap],
	forOverlay: true
})
export class CesiumPlanetSourceProvider extends BaseMapSourceProvider {

	createAsync(metaData: ICaseMapState): Promise<any> {
		let layer = this.createOrGetFromCache(metaData);
		let layerPromise = Promise.resolve(layer[0]);
		return layerPromise;
	}

	protected create(metaData: ICaseMapState): any[] {
		const planetLayer = new Cesium.UrlTemplateImageryProvider({
			url : metaData.data.overlay.imageUrl,
			credit: new Cesium.Credit('© Imagery provided by Planet.com', 'https://www.planet.com/assets/logos/logo-dark.png', 'https://www.planet.com')
		});
		const layer = new CesiumLayer(planetLayer);
		return [layer];
	}
}
