import { IBaseImageryVisualizerClass, IImageryVisualizerMetaData } from '../model/base-imagery-visualizer';
import { ImageryPlugin } from './imagery-plugin';

export function ImageryVisualizer(metaData: IImageryVisualizerMetaData) {
	return function (constructor: IBaseImageryVisualizerClass) {
		ImageryPlugin(metaData)(constructor);
	};
}
