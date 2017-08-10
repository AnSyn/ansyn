
import { EntitiesVisualizer } from '../entities-visualizer';

export const FootprintHitmapVisualizerType = 'FootprintHitmapVisualizer';

export class FootprintHitmapVisualizer extends EntitiesVisualizer {

	constructor(args: any) {
		super(FootprintHitmapVisualizerType, args);
		this.fillColor = 'rgba(255, 0, 0, 0.05)';
		this.strokeColor = 'rgba(0, 0, 0, 0.02)';
		this.containerLayerOpacity = 0.5;
	}
}
