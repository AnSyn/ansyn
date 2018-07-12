import { IBaseImageryVisualizerClass, IImageryVisualizerMetaData } from '../base-imagery-visualizer';
import { ImageryPlugin } from './imagery-plugin';

export function ImageryVisualizer(metaData: IImageryVisualizerMetaData) {
	return function (constructor: IBaseImageryVisualizerClass) {
		ImageryPlugin(metaData)(constructor);
	};
}
