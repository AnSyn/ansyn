import { IBaseImageryMapConstructor, IImageryMapMetaData } from '../model/base-imagery-map';
import { ImageryDecorator } from './index';

export function ImageryMap(metaData: IImageryMapMetaData): any {
	return function (constructor: IBaseImageryMapConstructor): void {
		ImageryDecorator<IImageryMapMetaData, IBaseImageryMapConstructor>(metaData)(constructor);
	};
}
