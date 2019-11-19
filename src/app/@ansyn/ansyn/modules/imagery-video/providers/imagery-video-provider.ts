import { BaseMapSourceProvider, ImageryMapSource, IMapSettings } from '@ansyn/imagery';
import { ImageryVideoMap } from '../map/imagery-video-map';

export const IMAGERY_VIDEO_SOURCE_TYPE = 'IMAGERY_VIDEO';

@ImageryMapSource({
	sourceType: IMAGERY_VIDEO_SOURCE_TYPE,
	supported: [ImageryVideoMap]
})
export class ImageryVideoProvider extends BaseMapSourceProvider {
	public create(metaData: IMapSettings): any {
		return Promise.resolve(metaData);
	}
}
