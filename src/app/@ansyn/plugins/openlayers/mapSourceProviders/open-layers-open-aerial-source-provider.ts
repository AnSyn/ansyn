import { ImageryMapSource } from '@ansyn/imagery';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';
import { ICaseMapState } from '@ansyn/core';
import { OpenLayersMap } from '../maps/open-layers-map/openlayers-map/openlayers-map';

export const OpenLayerOpenAerialSourceProviderSourceType = 'OPEN_AERIAL';

@ImageryMapSource({
	sourceType: OpenLayerOpenAerialSourceProviderSourceType,
	supported: [OpenLayersMap],
	forOverlay: true
})
export class OpenLayerOpenAerialSourceProvider extends OpenLayersMapSourceProvider {

	createAsync(metaData: ICaseMapState): Promise<any> {
		let layer = this.createOrGetFromCache(metaData);
		let layerPromise = Promise.resolve(layer[0]);
		layerPromise = this.addFootprintToLayerPromise(layerPromise, metaData);
		return layerPromise;
	}
}
