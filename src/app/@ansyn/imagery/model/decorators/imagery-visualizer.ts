import { BaseImageryVisualizerClass, ImageryVisualizerMetaData } from '../base-imagery-visualizer';
import { ImageryPlugin } from './imagery-plugin';

export function ImageryVisualizer(metaData: ImageryVisualizerMetaData) {
	return function (constructor: BaseImageryVisualizerClass) {
		ImageryPlugin(metaData)(constructor);
	};
}
