import { ImageryDecorator } from './index';
import { BaseImageryPluginConstructor, ImageryPluginMetaData } from '../base-imagery-plugin';


export function ImageryPlugin(metaData: ImageryPluginMetaData) {
	return function (constructor: BaseImageryPluginConstructor) {
		ImageryDecorator<ImageryPluginMetaData, BaseImageryPluginConstructor>(metaData)(constructor);
	}
}
