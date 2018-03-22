import { EntitiesVisualizer } from '../entities-visualizer';
import { VisualizerStateStyle } from '../models/visualizer-state';

export class GoToVisualizer extends EntitiesVisualizer {

	constructor(style: Partial<VisualizerStateStyle>) {
		super(style, {
			initial: {
				icon: {
					scale: 1,
					src: '/assets/icons/tools/go-to-map-marker.svg'
				}
			}
		});
	}
}
