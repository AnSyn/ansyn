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
		// layer[0].on('postcompose', e => {
		// 	const context = e.context;
		// 	const canvas = context.canvas;
		// 	const width = canvas.width;
		// 	const height = canvas.height;
		// 	const input = context.getImageData(0, 0, width, height).data;
		// 	const output = context.createImageData(width, height);
		// 	for (let pixelY = 0; pixelY < height; ++pixelY) {
		// 		for (let pixelX = 0; pixelX < width; ++pixelX) {
		// 			const index = (pixelY * width + pixelX) * 4;
		// 			// Manipulate rgba of the pixel:
		// 			output[index] = input[index]; // -> r
		// 			output[index + 1] = input[index + 1]; // -> g
		// 			output[index + 2] = input[index + 2]; // -> b
		// 			output[index + 3] = input[index + 3]; // alpha
		// 		}
		// 	}
		// 	context.putImageData(output, 0, 0);
		// });
		layerPromise = this.addFootprintToLayerPromise(layerPromise, metaData);
		return layerPromise;
	}
}
