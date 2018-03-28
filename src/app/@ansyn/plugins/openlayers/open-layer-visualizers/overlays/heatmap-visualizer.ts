import { EntitiesVisualizer } from '../entities-visualizer';
import { Injectable } from '@angular/core';

@Injectable()
export class FootprintHeatmapVisualizer extends EntitiesVisualizer {

	constructor() {
		super(null, {
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
