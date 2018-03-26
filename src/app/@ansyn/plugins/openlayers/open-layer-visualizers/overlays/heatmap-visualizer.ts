import { EntitiesVisualizer } from '../entities-visualizer';
import { IVisualizersConfig, VisualizersConfig } from '@ansyn/core/tokens/visualizers-config.token';
import { Inject, Injectable } from '@angular/core';

@Injectable()
export class FootprintHeatmapVisualizer extends EntitiesVisualizer {

	constructor(@Inject(VisualizersConfig) config: IVisualizersConfig) {
		super(config[FootprintHeatmapVisualizer.name], {
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
