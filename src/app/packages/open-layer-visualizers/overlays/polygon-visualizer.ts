import { EntitiesVisualizer } from '../entities-visualizer';

export const FootprintPolygonVisualizerType = 'FootprintPolygonVisualizer';

export class FootprintPolygonVisualizer extends EntitiesVisualizer {

	constructor(args: any) {
		super(FootprintPolygonVisualizerType, args);
		this.fillColor = 'transparent';
		this.strokeColor = 'yellow';
		this.containerLayerOpacity = 0.5;
	}
}
