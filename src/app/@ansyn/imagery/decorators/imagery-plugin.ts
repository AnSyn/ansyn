import { ImageryDecorator } from './index';
import { IBaseImageryPluginConstructor, IImageryPluginMetaData } from '../model/base-imagery-plugin';
import { AutoSubscriptions } from 'auto-subscriptions';


export function ImageryPlugin(metaData: IImageryPluginMetaData) {
	return function (constructor: IBaseImageryPluginConstructor) {
		ImageryDecorator(metaData)(constructor);
		AutoSubscriptions({ init: 'onInitSubscriptions', destroy: 'onDispose' })(constructor);
	};
}
