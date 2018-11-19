import { OpenLayersDisabledMap, OpenLayersMap, ProjectableRaster } from '@ansyn/plugins';
import { ImageryMapSource } from '@ansyn/imagery';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';
import { ICaseMapState } from '@ansyn/core';
import Projection from 'ol/proj/projection';
import Static from 'ol/source/imagestatic';
import ImageLayer from 'ol/layer/image';

export const OpenLayerTBSourceProviderSourceType = 'TB';

@ImageryMapSource({
	sourceType: OpenLayerTBSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap],
	forOverlay: true
})
export class OpenLayerTBSourceProvider extends OpenLayersMapSourceProvider {
	createAsync(metaData: ICaseMapState): Promise<any> {
		const extent: any = [0, 0, metaData.data.overlay.tag.imageData.ExifImageWidth, metaData.data.overlay.tag.imageData.ExifImageHeight];

		const source = new Static({
			attributions: '© <a href="http://xkcd.com/license.html">xkcd</a>',
			url: metaData.data.overlay.imageUrl,
			crossOrigin: 'anonymous',
			projection: new Projection({
				code: 'xkcd-image',
				units: 'pixels',
				extent
			}),
			imageExtent: extent
		});
		const imageLayer = new ImageLayer({
			source,
			extent
		});
		return Promise.resolve(imageLayer);
	}
}
