import { Injectable } from '@angular/core';
import { ImageryVisualizer } from '@ansyn/imagery';
import { OpenLayersMap, OpenLayersProjectionService } from '@ansyn/ol';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { PolygonSearchVisualizer } from './polygon-search.visualizer';
import { CaseGeoFilter } from '../../../../../menu-items/cases/models/case.model';
import { IGeoFilterStatus } from '../../../../../status-bar/reducers/status-bar.reducer';


@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, Actions, OpenLayersProjectionService],
	dontRestrictToExtent: true,
	layerClassName: 'polygon-layer',
	isHideable: true
})
@Injectable()
export class ScreenViewVisualizer extends PolygonSearchVisualizer {

	constructor(public store$: Store<any>,
				public actions$: Actions,
				public projectionService: OpenLayersProjectionService) {
		super(store$, actions$, projectionService);
		this.geoFilter = CaseGeoFilter.ScreenView;
	}

	shouldDrawRegion([geoFilter, isOverlayDisplay]): boolean {
		return isOverlayDisplay && super.shouldDrawRegion([geoFilter, isOverlayDisplay]);
	}
	interactionChanges([geoFilter, isActiveMap]: [IGeoFilterStatus, boolean]): void {
		this.removeDrawInteraction()
	}
}
