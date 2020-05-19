import { IBaseImageryLayer, BaseMapSourceProvider, ImageryMapSource, IMapSettings } from '@ansyn/imagery';
import { ImageryVideoMap } from '../map/imagery-video-map';

export const IMAGERY_VIDEO_SOURCE_TYPE = 'IMAGERY_VIDEO';

@ImageryMapSource({
	sourceType: IMAGERY_VIDEO_SOURCE_TYPE,
	supported: [ImageryVideoMap]
})
export class ImageryVideoProvider extends BaseMapSourceProvider {
	public create(metaData: IMapSettings): Promise<IBaseImageryLayer> {
		// Add the metadata to a JS Map object, to obtain the required set() and get() methods
		const mapLikeLayer = Object.assign(new Map(), metaData);
		return Promise.resolve(mapLikeLayer);
	}
}
