import { OverlaysService } from '@ansyn/overlays';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { ImageryVisualizer, IVisualizersConfig, VisualizersConfig } from '@ansyn/imagery';
import { IVisualizerEntity } from '@ansyn/core';
import * as turf from '@turf/turf';
import { OpenLayersMap } from '../../../maps/open-layers-map/openlayers-map/openlayers-map';
import { BaseFootprintsVisualizer } from './base-footprints-visualizer';
import { Inject } from '@angular/core';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, VisualizersConfig, Actions, OverlaysService]
})
export class FootprintHeatmapVisualizer extends BaseFootprintsVisualizer {

	constructor(public store: Store<any>,
				@Inject(VisualizersConfig) public config: IVisualizersConfig,
				public actions$: Actions,
				public overlaysService: OverlaysService
	) {
		super(store, overlaysService, 'Heatmap', config.FootprintHeatmapVisualizer, {
			opacity: 0.5,
			initial: {
				fill: 'rgb(255, 0, 0)',
				'fill-opacity': 0.05,
				stroke: 'rgb(0, 0, 0)',
				'stroke-opacity': 0.02
			}
		});
	}

}
