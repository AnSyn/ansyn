import { statusBarFlagsItemsEnum, UpdateStatusFlagsAction } from '@ansyn/status-bar';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { CaseRegionState } from '@ansyn/core';
import { UUID } from 'angular2-uuid';
import { RegionVisualizer } from '@ansyn/plugins/openlayers/visualizers/region/region.visualizer';
import * as turf from '@turf/turf';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import { Position } from 'geojson';
import { CaseGeoFilter } from '@ansyn/core/models/case.model';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { Injectable } from '@angular/core';
@Injectable()
export class PolygonSearchVisualizer extends RegionVisualizer {
	static fillAlpha = 0.4;

	constructor(public store$: Store<any>,
				public actions$: Actions,
				public projectionService: ProjectionService) {

		super(store$, actions$, projectionService, CaseGeoFilter.Polygon);

		this.updateStyle({
			initial: {
				stroke: {
					color: '#f32ee1',
					width: 4
				},
				point: {
					radius: 4
				},
				line: {
					width: 1
				}
			}
		});
	}

	drawRegionOnMap(region: CaseRegionState): Observable<boolean> {
		const id = UUID.UUID();
		const featureJson = turf.polygon(region.coordinates);
		const entities = [{ id, featureJson }];
		return this.setEntities(entities);
	}

	createRegion({ geometry }: any) {
		return geometry;
	}

	onContextMenu(point: Position): void {
		this.store$.dispatch(new UpdateStatusFlagsAction({ key: statusBarFlagsItemsEnum.geoFilterSearch, value: true }));
	}
}
