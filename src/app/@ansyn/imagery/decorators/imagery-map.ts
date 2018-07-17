import { IImageryMapMetaData, IBaseImageryMapConstructor } from '../model/base-imagery-map';
import { ImageryDecorator } from './index';

export function ImageryMap(metaData: IImageryMapMetaData) {
	return function (constructor: IBaseImageryMapConstructor) {
		ImageryDecorator<IImageryMapMetaData, IBaseImageryMapConstructor>(metaData)(constructor);
	}
}
