import { OpenLayersDisabledMap, OpenLayersMap } from '@ansyn/plugins';
import { ImageryMapSource } from '@ansyn/imagery';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';
import { ICaseMapState } from '@ansyn/core';

export const OpenLayerPlanetSourceProviderSourceType = 'PLANET';

@ImageryMapSource({
	sourceType: OpenLayerPlanetSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap],
	forOverlay: true
})
export class OpenLayerPlanetSourceProvider extends OpenLayersMapSourceProvider {

	createAsync(metaData: ICaseMapState): Promise<any> {
		let layer = this.createOrGetFromCache(metaData);
		let layerPromise = Promise.resolve(layer[0]);
		layerPromise = this.addFootprintToLayerPromise(layerPromise, metaData);
		return layerPromise;
	}
}
