import { ImageryDecorator } from './index';
import { IBaseImageryPluginConstructor, IImageryPluginMetaData } from '../base-imagery-plugin';
import { AutoSubscriptions } from 'auto-subscriptions';


export function ImageryPlugin(metaData: IImageryPluginMetaData) {
	return function (constructor: IBaseImageryPluginConstructor) {
		ImageryDecorator<IImageryPluginMetaData, IBaseImageryPluginConstructor>(metaData)(constructor);
		AutoSubscriptions({ init: 'onInitSubscriptions', destroy: 'onDispose' })(constructor)
	}
}
