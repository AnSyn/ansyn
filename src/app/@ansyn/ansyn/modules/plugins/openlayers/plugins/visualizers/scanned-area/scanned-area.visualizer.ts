import { combineLatest } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { selectOverlayFromMap } from '@ansyn/map-facade';
import { ImageryVisualizer, IVisualizerEntity, MarkerSize } from '@ansyn/imagery';
import { AutoSubscription } from 'auto-subscriptions';
import { filter, mergeMap } from 'rxjs/operators';
import { EntitiesVisualizer, OpenLayersMap, OpenLayersProjectionService } from '@ansyn/ol';
import { IOverlaysScannedAreaData } from '../../../../../menu-items/cases/models/case.model';
import { selectScannedAreaData } from '../../../../../overlays/overlay-status/reducers/overlay-status.reducer';
import { IOverlay } from '../../../../../overlays/models/overlay.model';
import { feature } from '@turf/turf';


@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, Actions, OpenLayersProjectionService]
})
export class ScannedAreaVisualizer extends EntitiesVisualizer {

	@AutoSubscription
	scannedArea$ = () => combineLatest(this.store$.select(selectScannedAreaData), this.store$.select(selectOverlayFromMap(this.mapId))).pipe(
		filter(([scannedAreaData, overlay]: [IOverlaysScannedAreaData, IOverlay]) => Boolean(overlay) && Boolean(scannedAreaData)),
		mergeMap(([scannedAreaData, overlay]: [IOverlaysScannedAreaData, IOverlay]) => {
			const entities: IVisualizerEntity[] = [];
			if (!Boolean(overlay) || !Boolean(scannedAreaData[overlay.id])) {
				this.clearEntities();
			} else {
				entities.push({
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
