import { IBaseImageryMapConstructor, IImageryMapMetaData } from '../model/base-imagery-map';
import { ImageryDecorator } from './index';
import { AutoSubscriptions } from 'auto-subscriptions';

export function ImageryMap(metaData: IImageryMapMetaData): any {
	return function (constructor: IBaseImageryMapConstructor): void {
		ImageryDecorator(metaData)(constructor);
		AutoSubscriptions({ init: 'initMapSubscriptions', destroy: 'dispose' })(constructor);
	};
}
