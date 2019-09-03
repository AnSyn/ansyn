import { combineLatest, EMPTY, Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { FeatureCollection, GeometryObject } from 'geojson';
import { IMapState, selectActiveMapId, selectMapStateById, selectOverlayFromMap } from '@ansyn/map-facade';
import {
	getPointByGeometry,
	getPolygonByPointAndRadius,
	ImageryVisualizer, IVisualizerEntity, MarkerSize,
	VisualizerInteractions
} from '@ansyn/imagery';
import Draw from 'ol/interaction/Draw';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { distinctUntilChanged, filter, map, mergeMap, take, tap } from 'rxjs/operators';
import { EntitiesVisualizer, OpenLayersMap, OpenLayersProjectionService } from '@ansyn/ol';
import { ICase, ICaseMapState, IOverlaysScannedAreaData } from '../../../../../menu-items/cases/models/case.model';
import { selectScannedAreaData } from '../../../../../overlays/overlay-status/reducers/overlay-status.reducer';
import { IOverlay } from '../../../../../overlays/models/overlay.model';
import { feature } from '@turf/turf';
import { OnDestroy, OnInit } from '@angular/core';


@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, Actions, OpenLayersProjectionService]
})
export class ScannedAreaVisualizer extends EntitiesVisualizer{

	@AutoSubscription
	scannedArea$ = () => combineLatest(this.store$.select(selectScannedAreaData), this.store$.select(selectOverlayFromMap(this.mapId))).pipe(
		filter( ([scannedAreaData, overlay]: [IOverlaysScannedAreaData, IOverlay]) => Boolean(overlay) && Boolean(scannedAreaData)),
		mergeMap(([scannedAreaData, overlay]: [IOverlaysScannedAreaData, IOverlay]) => {
			const entities: IVisualizerEntity[] = [];
			if (!Boolean(overlay) || !Boolean(scannedAreaData[overlay.id])) {
				this.clearEntities();
			} else {
				entities.push( {
					id: 'scannedArea',
					featureJson: feature(scannedAreaData[overlay.id])
				});
			}
			return this.setEntities(entities);
		})
	);

	constructor(
		public store$: Store<any>,
		public actions$: Actions,
		public projectionService: OpenLayersProjectionService
	) {
		super();
		this.updateStyle({
			opacity: 0.3,
			initial: {
				stroke: '#1f1afb',
				fill: '#39f814',
				'stroke-width': 4,
				'marker-size': MarkerSize.small,
				'marker-color': '#39f814'
			}
		});
	}
}
