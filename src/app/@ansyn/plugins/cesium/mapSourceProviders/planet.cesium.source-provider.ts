import { BaseMapSourceProvider, ImageryMapSource } from '@ansyn/imagery';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';
import { ICaseMapState } from '@ansyn/core';
import { OpenLayersMap } from '../maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersDisabledMap } from '../maps/openlayers-disabled-map/openlayers-disabled-map';
import { CesiumMap } from '../maps/cesium-map/cesium-map';
declare const Cesium: any;

export const OpenLayerPlanetSourceProviderSourceType = 'PLANET';

@ImageryMapSource({
	sourceType: OpenLayerPlanetSourceProviderSourceType,
	supported: [CesiumMap],
	forOverlay: true
})
export class OpenLayerPlanetSourceProvider extends BaseMapSourceProvider {

	protected create(metaData: ICaseMapState): any[] {
		const xyzTileLayer = new Cesium.UrlTemplateImageryProvider({
			url: metaData.data.overlay.imageUrl
		});
		return [xyzTileLayer];
	}
}
