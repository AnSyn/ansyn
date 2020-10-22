import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import * as turf from '@turf/turf';
import { Observable } from 'rxjs';
import { Feature, Polygon, Position } from 'geojson';
import {
	convertLineSegmentToThinRectangle,
	getPolygonByPointAndRadius,
	ImageryVisualizer,
	MarkerSize
} from '@ansyn/imagery';
import { UpdateGeoFilterStatus } from '../../../../../status-bar/actions/status-bar.actions';
import { RegionVisualizer } from './region.visualizer';
import { OpenLayersMap, OpenLayersProjectionService } from '@ansyn/ol';
import { CaseGeoFilter, CaseRegionState } from '../../../../../menu-items/cases/models/case.model';
import { Injectable } from '@angular/core';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, Actions, OpenLayersProjectionService],
	dontRestrictToExtent: true,
	layerClassName: 'polygon-layer'
})
@Injectable()
export class PolygonSearchVisualizer extends RegionVisualizer {
	constructor(public store$: Store<any>,
				public actions$: Actions,
				public projectionService: OpenLayersProjectionService) {

		super(store$, actions$, projectionService, CaseGeoFilter.Polygon);

		this.updateStyle({
			initial: {
				stroke: '#0091ff',
				fill: null,
				'stroke-width': 4,
				'marker-size': MarkerSize.small,
				'marker-color': '#0091ff'
			}
		});
	}

	drawRegionOnMap(region: CaseRegionState): Observable<boolean> {
		const id = 'pinPolygon';
		const featureJson = region.type === 'Point' ? getPolygonByPointAndRadius(region.coordinates) : turf.polygon(region.coordinates);
		const entities = [{ id, featureJson }];
		return this.setEntities(entities);
	}

	createRegion({ geometry }: Feature<Polygon>): Polygon {
		if (geometry.type === CaseGeoFilter.Polygon && geometry.coordinates[0].length === 	3) {
			const region = convertLineSegmentToThinRectangle(geometry);
			return region;
		}
		return geometry;
	}

	onContextMenu(point: Position): void {
		this.store$.dispatch(new UpdateGeoFilterStatus({ type: this.geoFilter, active: true }));
	}
}
