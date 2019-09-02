import { combineLatest, EMPTY, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
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
import { AutoSubscription } from 'auto-subscriptions';
import { distinctUntilChanged, filter, map, mergeMap, take, tap } from 'rxjs/operators';
import { EntitiesVisualizer, OpenLayersMap, OpenLayersProjectionService } from '@ansyn/ol';
import { ICase, ICaseMapState, IOverlaysScannedAreaData } from '../../../../../menu-items/cases/models/case.model';
import { selectScannedAreaData } from '../../../../../overlays/overlay-status/reducers/overlay-status.reducer';
import { IOverlay } from '../../../../../overlays/models/overlay.model';
import { feature } from '@turf/turf';


@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, Actions, OpenLayersProjectionService]
})
export class ScannedAreaVisualizer extends EntitiesVisualizer {

	@AutoSubscription
	scannedArea$ = combineLatest(this.store$.select(selectScannedAreaData), this.store$.select(selectOverlayFromMap(this.mapId))).pipe(
		tap(([scannedAreaData, overlay]: [IOverlaysScannedAreaData, IOverlay]) => {
			if (!Boolean(overlay) || !Boolean(scannedAreaData[overlay.id])) {
				this.clearEntities();
			} else {
				const entity: IVisualizerEntity = {
					id: 'scannedArea',
					featureJson: feature(scannedAreaData[overlay.id])
				};
				this.setEntities([entity]);
			}
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
				fill: '#f32ee1',
				'stroke-width': 4,
				'marker-size': MarkerSize.small,
				'marker-color': '#f32ee1'
			}
		});
	}
}
