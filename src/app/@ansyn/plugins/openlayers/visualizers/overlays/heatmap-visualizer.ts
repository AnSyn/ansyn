import { OverlaysService } from '@ansyn/overlays';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { ImageryVisualizer } from '@ansyn/imagery';
import { IVisualizerEntity } from '@ansyn/core';
import * as turf from '@turf/turf';
import { OpenLayersMap } from '../../open-layers-map/openlayers-map/openlayers-map';
import { BaseFootprintsVisualizer } from './base-footprints-visualizer';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, Actions, OverlaysService]
})
export class FootprintHeatmapVisualizer extends BaseFootprintsVisualizer {

	geometryToEntity(id, footprint): IVisualizerEntity {
		const fp = turf.simplify(turf.multiPolygon(footprint.coordinates), { tolerance: 0.01, highQuality: true });
		return super.geometryToEntity(id, fp.geometry);
	}

	constructor(public store: Store<any>,
				public actions$: Actions,
				public overlaysService: OverlaysService
	) {
		super(store, overlaysService, 'Heatmap', null, {
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
