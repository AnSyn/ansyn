import { EntitiesVisualizer } from '../entities-visualizer';
import { VisualizerStateStyle } from '../models/visualizer-state';

export const FootprintPolygonVisualizerType = 'FootprintPolygonVisualizer';

export class FootprintPolygonVisualizer extends EntitiesVisualizer {
	constructor(style: Partial<VisualizerStateStyle>) {
		super(FootprintPolygonVisualizerType, style, {
			opacity: 0.5,
			initial: {
				stroke: {
					color: 'yellow'
				}
			}
		});
	}
}
