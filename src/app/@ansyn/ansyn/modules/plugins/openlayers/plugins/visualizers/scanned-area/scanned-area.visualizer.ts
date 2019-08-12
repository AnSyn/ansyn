import { combineLatest, EMPTY, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { FeatureCollection, GeometryObject } from 'geojson';
import { selectActiveMapId } from '@ansyn/map-facade';
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
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Feature from 'ol/Feature';
import { selectCaseScannedArea, selectSelectedCase } from '../../../../../menu-items/cases/reducers/cases.reducer';
import { ICase, ICaseMapState, IOverlaysScannedArea } from '../../../../../menu-items/cases/models/case.model';

@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, Actions, OpenLayersProjectionService]
})
export class ScannedAreaVisualizer extends EntitiesVisualizer {

	@AutoSubscription
	scannedArea$ = combineLatest(this.store$.select(selectCaseScannedArea), this.store$.select(selectSelectedCase)).pipe(
		map(([scannedAreaData, selectedCase]: [IOverlaysScannedArea, ICase]) => {
			const currentMapData = selectedCase.state.maps.data.find((state) => {
				return state.id === this.mapId});
			return [scannedAreaData, currentMapData];
		}),
		filter(([scannedAreaData, selectedCaseState]: [IOverlaysScannedArea, ICaseMapState]) => {
			return (Boolean(selectedCaseState) && Boolean(selectedCaseState.data.overlay));
		}),
		tap(([scannedAreaData, selectedCaseState]: [IOverlaysScannedArea, ICaseMapState]) => {
			const id = 'scannedArea';
			if (scannedAreaData && scannedAreaData[selectedCaseState.data.overlay.id]) {
				const entities: [IVisualizerEntity] = [{ id, featureJson: scannedAreaData[selectedCaseState.data.overlay.id] }];
				this.setEntities(entities);
			} else {
				this.clearEntities();
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
