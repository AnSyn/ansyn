import { statusBarFlagsItemsEnum, UpdateStatusFlagsAction } from 'app/@ansyn/status-bar/index';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { CaseRegionState } from 'app/@ansyn/core/index';
import { UUID } from 'angular2-uuid';
import { RegionVisualizer } from 'app/@ansyn/plugins/openlayers/visualizers/region/region.visualizer';
import * as turf from '@turf/turf';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import { Position } from 'geojson';

export class PolygonSearchVisualizer extends RegionVisualizer {
	static fillAlpha = 0.4;

	constructor(public store$: Store<any>,
				public actions$: Actions) {

		super(store$, actions$, 'Polygon');

		this.updateStyle({
			initial: {
				stroke: {
					color: '#27b2cfe6',
					width: 1
				},
				fill: {
					color: `rgba(255, 255, 255, ${PolygonSearchVisualizer.fillAlpha})`
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
