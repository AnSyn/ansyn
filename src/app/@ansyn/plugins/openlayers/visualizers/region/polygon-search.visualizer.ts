import { UpdateStatusFlagsAction } from '@ansyn/status-bar/actions/status-bar.actions';
import { Actions } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { UUID } from 'angular2-uuid';
import { RegionVisualizer } from '@ansyn/plugins/openlayers/visualizers/region/region.visualizer';
import * as turf from '@turf/turf';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import { Position } from 'geojson';
import { CaseGeoFilter, CaseRegionState } from '@ansyn/core/models/case.model';
import { ProjectionService } from '@ansyn/imagery/projection-service/projection.service';
import { Injectable } from '@angular/core';
import { statusBarFlagsItemsEnum } from '@ansyn/status-bar/models/status-bar-flag-items.model';
import { OpenlayersMapName } from '@ansyn/plugins/openlayers/open-layers-map/openlayers-map/openlayers-map';
import { ImageryPlugin } from '@ansyn/imagery/model/base-imagery-plugin';

@ImageryPlugin({
	supported: [OpenlayersMapName],
	deps: [Store, Actions, ProjectionService]
})
export class PolygonSearchVisualizer extends RegionVisualizer {
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
