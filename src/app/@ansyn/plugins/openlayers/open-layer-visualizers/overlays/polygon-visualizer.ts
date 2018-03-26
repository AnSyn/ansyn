import { EntitiesVisualizer } from '../entities-visualizer';
import { VisualizerStateStyle } from '../models/visualizer-state';

export class FootprintPolygonVisualizer extends EntitiesVisualizer {

	constructor() {
		super(null, {
			opacity: 0.5,
			initial: {
				stroke: {
					color: 'yellow'
				}
			}
		});
	}
}
