import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { UUID } from 'angular2-uuid';
import * as turf from '@turf/turf';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/combineLatest';
import { Position } from 'geojson';
import { CaseGeoFilter, CaseRegionState } from '@ansyn/core';
import { ProjectionService } from '@ansyn/imagery';
import { getPolygonByPointAndRadius } from '@ansyn/core';
import { UpdateGeoFilterStatus } from '@ansyn/status-bar';
import { ImageryVisualizer } from '@ansyn/imagery';
import { MarkerSize } from '@ansyn/core';
import { RegionVisualizer } from './region.visualizer';
import { OpenLayersMap } from '../../open-layers-map/openlayers-map/openlayers-map';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, Actions, ProjectionService]
})
export class PolygonSearchVisualizer extends RegionVisualizer {
	constructor(public store$: Store<any>,
				public actions$: Actions,
				public projectionService: ProjectionService) {

		super(store$, actions$, projectionService, CaseGeoFilter.Polygon);

		this.updateStyle({
			initial: {
				stroke: '#f32ee1',
				fill: null,
				'stroke-width': 4,
				'marker-size': MarkerSize.small,
				'marker-color': '#f32ee1'
			}
		});
	}

	drawRegionOnMap(region: CaseRegionState): Observable<boolean> {
		const id = UUID.UUID();
		const featureJson = region.type === "Point" ? getPolygonByPointAndRadius(region.coordinates) : turf.polygon(region.coordinates);
		const entities = [{ id, featureJson }];
		return this.setEntities(entities);
	}

	createRegion({ geometry }: any) {
		return geometry;
	}

	onContextMenu(point: Position): void {
		this.store$.dispatch(new UpdateGeoFilterStatus({ searchMode: this.geoFilter, indicator: true }));
	}
}
