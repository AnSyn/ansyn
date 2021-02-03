import {
	ImageryVisualizer,
	IVisualizerEntity,
	IVisualizersConfig,
	VisualizersConfig
} from '@ansyn/imagery';
import { combineLatest } from 'rxjs';
import { selectActiveMapId } from '@ansyn/map-facade';
import { Store } from '@ngrx/store';
import { AutoSubscription } from 'auto-subscriptions';
import { MeasureRulerVisualizer, OpenLayersMap, OpenLayersProjectionService } from '@ansyn/ol';
import { distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { Inject } from '@angular/core';
import {
	selectIsMeasureToolActive,
	selectMeasureDataByMapId
} from '../../../../../status-bar/components/tools/reducers/tools.reducer';
import {
	AddMeasureAction, RemoveMeasureAction,
} from '../../../../../status-bar/components/tools/actions/tools.actions';
import { isEqual } from 'lodash';

export const measuresClassNameForExport = 'measures-layer';
@ImageryVisualizer({
	supported: [OpenLayersMap],
	deps: [Store, OpenLayersProjectionService, VisualizersConfig],
	layerClassName: measuresClassNameForExport,
	isHideable: true
})
export class MeasureDistanceVisualizer extends MeasureRulerVisualizer {

	constructor(protected store$: Store<any>,
				protected projectionService: OpenLayersProjectionService,
				@Inject(VisualizersConfig) config: IVisualizersConfig) {
		super(projectionService, config);
	}

	@AutoSubscription
	show$ = () => combineLatest([
		this.store$.select(selectActiveMapId),
		this.store$.select(selectMeasureDataByMapId(this.mapId)),
		this.store$.select(selectIsMeasureToolActive)]).pipe(
		distinctUntilChanged((a, b) => {
			const equal = isEqual(a, b);
			return equal;
		}),
		// filter() update - checking isMeasureToolActive: if the measures layer is
		// hidden, we still want to proceed if the measure tool changed to inactive,
		// in order to cancel cursor style and interactions.
		filter(([activeMapId, measureData, isMeasureToolActive]) => (!this.isHidden || !isMeasureToolActive)),
		tap(([activeMapId, measureData, isMeasureToolActive]) => {
			if (measureData) {
				if (!measureData?.isLayerShowed) {
					this.iMap.removeLayer(this.vector);
				} else {
					this.iMap.addLayer(this.vector);
					this.enableRuler(isMeasureToolActive && activeMapId && measureData?.isToolActive);
					this.startDeleteSingleEntity(isMeasureToolActive && activeMapId && measureData?.isRemoveMeasureModeActive);
				}
			}
		}),
		switchMap(([activeMapId, measureData, isMeasureToolActive]) => {
			return this.setEntities(measureData?.measures || []);
		})
	);

	afterEntityDeleted(entity: IVisualizerEntity) {
		this.store$.dispatch(new RemoveMeasureAction({
			mapId: this.mapId,
			measureId: entity.id
		}));
	}

	afterDrawEndEvent(entity: IVisualizerEntity) {
		this.store$.dispatch(
			new AddMeasureAction({
				mapId: this.mapId,
				measure: entity
			})
		);
	}
}
