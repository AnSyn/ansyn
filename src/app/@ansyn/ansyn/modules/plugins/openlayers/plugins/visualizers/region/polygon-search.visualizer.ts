import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { UUID } from 'angular2-uuid';
import * as turf from '@turf/turf';
import { Observable } from 'rxjs';
import { Position } from 'geojson';
import { getPolygonByPointAndRadius, MarkerSize } from '@ansyn/imagery';
import { ImageryVisualizer } from '@ansyn/imagery';
import { UpdateGeoFilterStatus } from '../../../../../status-bar/actions/status-bar.actions';
import { RegionVisualizer } from './region.visualizer';
import { OpenLayersMap } from '../../../../../../../ol/maps/open-layers-map/openlayers-map/openlayers-map';
import { OpenLayersProjectionService } from '../../../../../../../ol/projection/open-layers-projection.service';
import { CaseGeoFilter, CaseRegionState } from '../../../../../menu-items/cases/models/case.model';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, Actions, OpenLayersProjectionService]
})
export class PolygonSearchVisualizer extends RegionVisualizer {
	constructor(public store$: Store<any>,
				public actions$: Actions,
				public projectionService: OpenLayersProjectionService) {

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
		const featureJson = region.type === 'Point' ? getPolygonByPointAndRadius(region.coordinates) : turf.polygon(region.coordinates);
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
