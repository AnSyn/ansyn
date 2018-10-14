import XYZ from 'ol/source/xyz';
import { ICaseMapState } from '@ansyn/core';
import { OpenLayersDisabledMap, OpenLayersMap } from '@ansyn/plugins';
import { ImageryMapSource } from '@ansyn/imagery';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';

export const OpenLayerPlanetSourceProviderSourceType = 'PLANET';

@ImageryMapSource({
	sourceType: OpenLayerPlanetSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayerPlanetSourceProvider extends OpenLayersMapSourceProvider {
	create(metaData: ICaseMapState): any[] {
		const source = this.getXYZSource(metaData.data.overlay.imageUrl);
		const extent = this.getExtent(metaData.data.overlay.footprint);
		const tileLayer = this.getTileLayer(source, extent);
		return [tileLayer];
	}

	createAsync(metaData: ICaseMapState): Promise<any> {
		let layer = this.createOrGetFromCache(metaData);
		return Promise.resolve(layer[0]);
	}
}
