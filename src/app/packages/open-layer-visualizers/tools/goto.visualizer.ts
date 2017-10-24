import { EntitiesVisualizer } from '../entities-visualizer';
import { VisualizerStateStyle } from '../models/visualizer-state';

export const GoToVisualizerType = 'GoToVisualizer';

export class GoToVisualizer extends EntitiesVisualizer {
	constructor(style: Partial<VisualizerStateStyle>) {
		super(GoToVisualizerType, style, {
			initial: {
				icon: {
					scale: 1,
					src: '/assets/icons/tools/go-to-map-marker.svg'
				}
			}
		});
	}
}
