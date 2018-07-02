import { ImageryMapMetaData, BaseImageryMapConstructor } from '../base-imagery-map';
import { ImageryDecorator } from './index';

export function ImageryMap(metaData: ImageryMapMetaData) {
	return function (constructor: BaseImageryMapConstructor) {
		ImageryDecorator<ImageryMapMetaData, BaseImageryMapConstructor>(metaData)(constructor);
	}
}
