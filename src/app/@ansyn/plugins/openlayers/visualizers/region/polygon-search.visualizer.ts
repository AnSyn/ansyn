import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { UUID } from 'angular2-uuid';
import { RegionVisualizer } from '@ansyn/plugins/openlayers/visualizers/region/region.visualizer';
import * as turf from '@turf/turf';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/combineLatest';
import { Position } from 'geojson';
import { CaseGeoFilter, CaseRegionState } from '@ansyn/core/models/case.model';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { OpenLayersMap } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { getPolygonByPointAndRadius } from '@ansyn/core/utils/geo';
import { UpdateGeoFilterStatus } from '@ansyn/status-bar/actions/status-bar.actions';
import { ImageryVisualizer } from '@ansyn/imagery/decorators/imagery-visualizer';
import { MarkerSize } from '@ansyn/core/models/visualizers/visualizer-style';

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
