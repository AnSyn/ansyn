import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY } from 'rxjs';
import { Position } from 'geojson';
import { ImageryVisualizer } from '@ansyn/imagery';
import { UpdateGeoFilterStatus } from '../../../../../status-bar/actions/status-bar.actions';
import { RegionVisualizer } from './region.visualizer';
import { OpenLayersMap, OpenLayersProjectionService } from '@ansyn/ol';
import { CaseGeoFilter } from '../../../../../menu-items/cases/models/case.model';
import { Injectable } from '@angular/core';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, Actions, OpenLayersProjectionService],
	dontRestrictToExtent: true,
	layerClassName: 'screen-view-layer'
})
@Injectable({providedIn: 'root'})
export class ScreenViewSearchVisualizer extends RegionVisualizer {
	constructor(public store$: Store<any>,
				public actions$: Actions,
				public projectionService: OpenLayersProjectionService) {

		super(store$, actions$, projectionService, CaseGeoFilter.ScreenView);
	}

	drawRegionOnMap() {
		return EMPTY;
	}

	createRegion({ geometry }: any) {
		return geometry;
	}

	onContextMenu(point: Position): void {
		this.store$.dispatch(new UpdateGeoFilterStatus({ type: this.geoFilter, active: true }));
	}
}
