import { OpenLayersDisabledMap, OpenLayersMap } from '@ansyn/plugins';
import { ImageryMapSource } from '@ansyn/imagery';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';
import { ICaseMapState } from '@ansyn/core';

export const OpenLayerOpenAerialSourceProviderSourceType = 'OPEN_AERIAL';

@ImageryMapSource({
	sourceType: OpenLayerOpenAerialSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap],
	forOverlay: true
})
export class OpenLayerOpenAerialSourceProvider extends OpenLayersMapSourceProvider {

	createAsync(metaData: ICaseMapState): Promise<any> {
		let layer = this.createOrGetFromCache(metaData);
		return Promise.resolve(layer[0]);
	}
}
