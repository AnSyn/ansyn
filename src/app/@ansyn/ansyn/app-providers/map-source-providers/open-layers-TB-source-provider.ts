import { OpenLayersDisabledMap, OpenLayersMap } from '@ansyn/plugins';
import { ImageryMapSource } from '@ansyn/imagery';
import { OpenLayersMapSourceProvider } from './open-layers.map-source-provider';
import { ICaseMapState } from '@ansyn/core';
import ImageLayer from 'ol/layer/image';
import Projection from 'ol/proj/projection';
import Static from 'ol/source/imageStatic';

export const OpenLayerTBSourceProviderSourceType = 'TB';

@ImageryMapSource({
	sourceType: OpenLayerTBSourceProviderSourceType,
	supported: [OpenLayersMap, OpenLayersDisabledMap]
})
export class OpenLayerTBSourceProvider extends OpenLayersMapSourceProvider {

	createAsync(metaData: ICaseMapState): Promise<any> {
		let layer = [ 
			new ImageLayer({
			  source: new Static({
				attributions: '© <a href="http://xkcd.com/license.html">xkcd</a>',
				url: 'https://imgs.xkcd.com/comics/online_communities.png',
				projection: new Projection({
					code: 'xkcd-image',
					units: 'pixels',
					extent: [0, 0, 1024, 968]
				  }),
				imageExtent: [0, 0, 1024, 968]
			  })
			})
		  ]
		return Promise.resolve(layer[0]);
	}
}
