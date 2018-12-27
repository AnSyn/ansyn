import { BaseMapSourceProvider, ImageryMapSource } from '@ansyn/imagery';
import { ICaseMapState } from '@ansyn/core';
import { CesiumMap } from '../maps/cesium-map/cesium-map';
declare const Cesium: any;

@ImageryMapSource({
	sourceType: 'PLANET',
	supported: [CesiumMap],
	forOverlay: true
})
export class CesiumPlanetSourceProvider extends BaseMapSourceProvider {

	protected create(metaData: ICaseMapState): any[] {
		const xyzTileLayer = new Cesium.UrlTemplateImageryProvider({
			url: metaData.data.overlay.imageUrl
		});
		return [xyzTileLayer];
	}
}
