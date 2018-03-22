import { EntitiesVisualizer } from '../entities-visualizer';
import { VisualizerStateStyle } from '../models/visualizer-state';

export class FootprintHeatmapVisualizer extends EntitiesVisualizer {

	constructor(style: Partial<VisualizerStateStyle>) {
		super(style, {
			opacity: 0.5,
			initial: {
				fill: {
					color: 'rgba(255, 0, 0, 0.05)'
				},
				stroke: {
					color: 'rgba(0, 0, 0, 0.02)'
				}
			}
		});
	}
}
